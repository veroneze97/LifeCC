import { supabase } from './supabase'
import { startOfMonth, addDays } from 'date-fns'

export async function checkIfDatabaseEmpty() {
    const { count: accountCount } = await supabase.from('accounts').select('*', { count: 'exact', head: true }).eq('user_id', 'local')
    const { count: transactionCount } = await supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', 'local')
    const { count: shiftCount } = await supabase.from('shifts').select('*', { count: 'exact', head: true }).eq('user_id', 'local')

    return (accountCount === 0 && transactionCount === 0 && shiftCount === 0)
}

export async function clearLocalData() {
    const userId = 'local'
    await Promise.all([
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('accounts').delete().eq('user_id', userId),
        supabase.from('shifts').delete().eq('user_id', userId),
        supabase.from('assets').delete().eq('user_id', userId),
        supabase.from('liabilities').delete().eq('user_id', userId),
        supabase.from('health_metrics').delete().eq('user_id', userId),
        supabase.from('goals').delete().eq('user_id', userId),
        supabase.from('profiles').delete().eq('user_id', userId)
    ])
}

export async function seedDatabase() {
    const userId = 'local'
    const today = new Date()
    const monthStart = startOfMonth(today)

    // 0. Profiles
    const { data: profiles, error: profError } = await supabase.from('profiles').insert([
        { user_id: userId, name: 'Caue', role: 'primary' },
        { user_id: userId, name: 'Carol', role: 'partner' }
    ]).select()

    if (profError || !profiles) {
        console.error('Error seeding profiles:', profError)
        return
    }

    const caue = profiles.find(p => p.name === 'Caue')?.id
    const carol = profiles.find(p => p.name === 'Carol')?.id

    // 1. Accounts
    const { data: accounts, error: accError } = await supabase.from('accounts').insert([
        { user_id: userId, profile_id: caue, name: 'Caue – Nubank', type: 'checking', balance_initial: 5000 },
        { user_id: userId, profile_id: caue, name: 'Caue – Itaú', type: 'checking', balance_initial: 15000 },
        { user_id: userId, profile_id: carol, name: 'Carol – Santander', type: 'checking', balance_initial: 3000 },
        { user_id: userId, profile_id: caue, name: 'Investimentos – Conjunto', type: 'investment', balance_initial: 80000 }
    ]).select()

    if (accError || !accounts) {
        console.error('Error seeding accounts:', accError)
        return
    }

    const cauePF = accounts.find(a => a.name === 'Caue – Nubank')?.id
    const carolPF = accounts.find(a => a.name === 'Carol – Santander')?.id
    const conjInv = accounts.find(a => a.name === 'Investimentos – Conjunto')?.id

    // 2. Shifts (Only for Caue as Example)
    await supabase.from('shifts').insert([
        {
            user_id: userId,
            profile_id: caue,
            date: addDays(monthStart, 5).toISOString(),
            place: 'Hospital Santa Cruz',
            value_expected: 1200,
            status: 'paid',
            payment_due_date: addDays(monthStart, 15).toISOString()
        },
        {
            user_id: userId,
            profile_id: caue,
            date: addDays(monthStart, 12).toISOString(),
            place: 'UPA Central',
            value_expected: 1500,
            status: 'invoiced',
            payment_due_date: addDays(monthStart, 30).toISOString()
        }
    ])

    // 3. Transactions
    await supabase.from('transactions').insert([
        // Caue Expenses
        { user_id: userId, profile_id: caue, account_id: cauePF!, date: addDays(monthStart, 2).toISOString(), type: 'expense', category: 'Aluguel', description: 'Aluguel Apartamento', amount: 3500, status: 'paid' },
        { user_id: userId, profile_id: caue, account_id: cauePF!, date: addDays(monthStart, 3).toISOString(), type: 'expense', category: 'Alimentação', description: 'Supermercado', amount: 800, status: 'paid' },

        // Carol Expenses
        { user_id: userId, profile_id: carol, account_id: carolPF!, date: addDays(monthStart, 7).toISOString(), type: 'expense', category: 'Lazer', description: 'Cinema & Jantar', amount: 300, status: 'paid' },
        { user_id: userId, profile_id: carol, account_id: carolPF!, date: addDays(monthStart, 15).toISOString(), type: 'expense', category: 'Transporte', description: 'Gasolina', amount: 250, status: 'paid' },

        // Caue Income
        { user_id: userId, profile_id: caue, account_id: cauePF!, date: addDays(monthStart, 5).toISOString(), type: 'income', category: 'Salário', description: 'Salário Residência', amount: 4200, status: 'paid' },

        // Carol Income
        { user_id: userId, profile_id: carol, account_id: carolPF!, date: addDays(monthStart, 5).toISOString(), type: 'income', category: 'Salário', description: 'Salário Carol', amount: 5500, status: 'paid' },

        // Conjunto
        { user_id: userId, profile_id: caue, account_id: conjInv!, date: addDays(monthStart, 25).toISOString(), type: 'expense', category: 'Investimentos', description: 'Aporte Mensal', amount: 2000, status: 'paid' }
    ])

    // 4. Assets & Liabilities
    await supabase.from('assets').insert([
        { user_id: userId, profile_id: caue, name: 'Previdência – Caue', type: 'investment', value: 30000, date_reference: monthStart.toISOString() },
        { user_id: userId, profile_id: carol, name: 'Previdência – Carol', type: 'investment', value: 25000, date_reference: monthStart.toISOString() }
    ])

    await supabase.from('liabilities').insert([
        { user_id: userId, profile_id: caue, name: 'Cartão Caue', type: 'credit_card', value: 2000, date_reference: monthStart.toISOString() },
        { user_id: userId, profile_id: carol, name: 'Cartão Carol', type: 'credit_card', value: 1500, date_reference: monthStart.toISOString() }
    ])

    // 5. Health Metrics
    await supabase.from('health_metrics').insert([
        { user_id: userId, profile_id: caue, date: addDays(monthStart, 1).toISOString(), weight: 82.5, workouts: 1, notes: 'Caue Workout' },
        { user_id: userId, profile_id: carol, date: addDays(monthStart, 1).toISOString(), weight: 60.5, workouts: 1, notes: 'Carol Workout' }
    ])

    // 6. Goals
    await supabase.from('goals').insert([
        {
            user_id: userId,
            profile_id: caue,
            name: 'Viajar para a Europa',
            target_value: 20000,
            monthly_contribution: 1000,
            expected_return_rate: 0,
            scope: 'individual'
        },
        {
            user_id: userId,
            profile_id: null,
            name: 'Casa Própria',
            target_value: 500000,
            monthly_contribution: 5000,
            expected_return_rate: 0,
            scope: 'joint'
        }
    ])

    console.log('Database seeded successfully with multiple profiles')
}
