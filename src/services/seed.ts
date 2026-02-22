import { addDays, startOfMonth } from 'date-fns'

import { supabase } from './supabase'

async function getProfileId() {
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
        throw new Error('Usuário não autenticado para executar seed.')
    }

    const profileId = authData.user.id
    await supabase.from('profiles').upsert({
        id: profileId,
        name: authData.user.user_metadata?.full_name || authData.user.email || 'Usuário',
        role: 'primary'
    })

    return profileId
}

export async function checkIfDatabaseEmpty() {
    const profileId = await getProfileId()
    const { count: accountCount } = await supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('profile_id', profileId)
    const { count: transactionCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('profile_id', profileId)
    const { count: shiftCount } = await supabase.from('shifts').select('*', { count: 'exact', head: true }).eq('profile_id', profileId)

    return (accountCount === 0 && transactionCount === 0 && shiftCount === 0)
}

export async function clearLocalData() {
    const profileId = await getProfileId()
    await Promise.all([
        supabase.from('transactions').delete().eq('profile_id', profileId),
        supabase.from('accounts').delete().eq('profile_id', profileId),
        supabase.from('shifts').delete().eq('profile_id', profileId),
        supabase.from('assets').delete().eq('profile_id', profileId),
        supabase.from('liabilities').delete().eq('profile_id', profileId),
        supabase.from('health_metrics').delete().eq('profile_id', profileId),
        supabase.from('goals').delete().eq('profile_id', profileId)
    ])
}

export async function seedDatabase() {
    const profileId = await getProfileId()
    const monthStart = startOfMonth(new Date())

    const { data: accounts, error: accError } = await supabase.from('accounts').insert([
        { profile_id: profileId, name: 'Conta Principal', type: 'checking', balance_initial: 5000 },
        { profile_id: profileId, name: 'Investimentos', type: 'investment', balance_initial: 30000 }
    ]).select()

    if (accError || !accounts) {
        throw accError || new Error('Erro ao criar contas de seed.')
    }

    const mainAccount = accounts[0]?.id
    const investAccount = accounts[1]?.id

    await supabase.from('shifts').insert([
        {
            profile_id: profileId,
            date: addDays(monthStart, 5).toISOString(),
            place: 'Hospital Central',
            value_expected: 1200,
            status: 'paid',
            payment_due_date: addDays(monthStart, 15).toISOString()
        }
    ])

    await supabase.from('transactions').insert([
        { profile_id: profileId, account_id: mainAccount, date: addDays(monthStart, 2).toISOString(), type: 'expense', category: 'Moradia', description: 'Aluguel', amount: 2500, status: 'paid' },
        { profile_id: profileId, account_id: mainAccount, date: addDays(monthStart, 5).toISOString(), type: 'income', category: 'Salário', description: 'Salário mensal', amount: 8000, status: 'paid' },
        { profile_id: profileId, account_id: investAccount, date: addDays(monthStart, 25).toISOString(), type: 'expense', category: 'Investimentos', description: 'Aporte mensal', amount: 2000, status: 'paid' }
    ])

    await supabase.from('assets').insert([
        { profile_id: profileId, name: 'Reserva de Emergência', type: 'investment', value: 30000, date_reference: monthStart.toISOString() }
    ])

    await supabase.from('liabilities').insert([
        { profile_id: profileId, name: 'Cartão de Crédito', type: 'credit_card', value: 1500, date_reference: monthStart.toISOString() }
    ])

    await supabase.from('health_metrics').insert([
        { profile_id: profileId, date: addDays(monthStart, 1).toISOString(), weight: 82, workouts: 1, notes: 'Treino A' }
    ])

    await supabase.from('goals').insert([
        {
            profile_id: profileId,
            name: 'Reserva de 12 meses',
            target_value: 120000,
            monthly_contribution: 3000,
            expected_return_rate: 0,
            scope: 'individual'
        }
    ])
}
