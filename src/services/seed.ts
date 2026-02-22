import { addDays, startOfMonth } from 'date-fns'

import { getCurrentUserId } from './auth'
import { ensureUserBootstrap } from './bootstrap'
import { supabase } from './supabase'

async function getUserScope() {
    const userId = await getCurrentUserId()
    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user || authData.user.id !== userId) {
        throw new Error('Usuário não autenticado para executar seed.')
    }

    const { profileId } = await ensureUserBootstrap(authData.user)

    return { userId, profileId }
}

export async function checkIfDatabaseEmpty() {
    const { userId } = await getUserScope()
    const { count: accountCount } = await supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: transactionCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', userId)
    const { count: shiftCount } = await supabase.from('shifts').select('*', { count: 'exact', head: true }).eq('user_id', userId)

    return (accountCount === 0 && transactionCount === 0 && shiftCount === 0)
}

export async function clearLocalData() {
    const { userId } = await getUserScope()
    await Promise.all([
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('accounts').delete().eq('user_id', userId),
        supabase.from('shifts').delete().eq('user_id', userId),
        supabase.from('assets').delete().eq('user_id', userId),
        supabase.from('liabilities').delete().eq('user_id', userId),
        supabase.from('health_metrics').delete().eq('user_id', userId),
        supabase.from('goals').delete().eq('user_id', userId)
    ])
}

export async function seedDatabase() {
    const { userId, profileId } = await getUserScope()
    const monthStart = startOfMonth(new Date())

    const { data: accounts, error: accError } = await supabase.from('accounts').insert([
        { user_id: userId, profile_id: profileId, name: 'Conta Principal', type: 'checking', balance_initial: 5000 },
        { user_id: userId, profile_id: profileId, name: 'Investimentos', type: 'investment', balance_initial: 30000 }
    ]).select()

    if (accError || !accounts) {
        throw accError || new Error('Erro ao criar contas de seed.')
    }

    const mainAccount = accounts[0]?.id
    const investAccount = accounts[1]?.id

    await supabase.from('shifts').insert([
        {
            user_id: userId,
            profile_id: profileId,
            date: addDays(monthStart, 5).toISOString(),
            place: 'Hospital Central',
            value_expected: 1200,
            status: 'paid',
            payment_due_date: addDays(monthStart, 15).toISOString()
        }
    ])

    await supabase.from('transactions').insert([
        { user_id: userId, profile_id: profileId, account_id: mainAccount, date: addDays(monthStart, 2).toISOString(), type: 'expense', category: 'Moradia', description: 'Aluguel', amount: 2500, status: 'paid' },
        { user_id: userId, profile_id: profileId, account_id: mainAccount, date: addDays(monthStart, 5).toISOString(), type: 'income', category: 'Salário', description: 'Salário mensal', amount: 8000, status: 'paid' },
        { user_id: userId, profile_id: profileId, account_id: investAccount, date: addDays(monthStart, 25).toISOString(), type: 'expense', category: 'Investimentos', description: 'Aporte mensal', amount: 2000, status: 'paid' }
    ])

    await supabase.from('assets').insert([
        { user_id: userId, profile_id: profileId, name: 'Reserva de Emergência', type: 'investment', value: 30000, date_reference: monthStart.toISOString() }
    ])

    await supabase.from('liabilities').insert([
        { user_id: userId, profile_id: profileId, name: 'Cartão de Crédito', type: 'credit_card', value: 1500, date_reference: monthStart.toISOString() }
    ])

    await supabase.from('health_metrics').insert([
        { user_id: userId, profile_id: profileId, date: addDays(monthStart, 1).toISOString(), weight: 82, workouts: 1, notes: 'Treino A' }
    ])

    await supabase.from('goals').insert([
        {
            user_id: userId,
            profile_id: profileId,
            name: 'Reserva de 12 meses',
            target_value: 120000,
            monthly_contribution: 3000,
            expected_return_rate: 0,
            scope: 'individual'
        }
    ])
}
