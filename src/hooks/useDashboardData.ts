import { useState, useEffect, useMemo, useCallback } from 'react'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

import { supabase } from '../services/supabase'
import { useAuth } from './useAuth'
import { useFilter } from './useFilter'
import { calculateNetWorth, calculateMonthBalance, calculateInvestmentRate, calculateTopCategories, calculateProfileParticipation } from '../utils/financialCalculations'
import { calculateLifeScore } from '../utils/lifeScore'
import { calculateNWGrowth } from '../utils/projections'

import type { DashboardData, HistoricalPoint } from '../types/dashboard'
import type { Database } from '../types/database.types'

type Asset = Database['public']['Tables']['assets']['Row']
type Liability = Database['public']['Tables']['liabilities']['Row']
type Transaction = Database['public']['Tables']['transactions']['Row']
type Shift = Database['public']['Tables']['shifts']['Row']
type HealthMetric = Database['public']['Tables']['health_metrics']['Row']
type Goal = Database['public']['Tables']['goals']['Row']

export function useDashboardData() {
    const { user } = useAuth()
    const { monthDate, selectedProfileId, profiles } = useFilter()

    const [rawData, setRawData] = useState<{
        assets: Asset[],
        liabilities: Liability[],
        transactions: Transaction[],
        shifts: Shift[],
        health: HealthMetric[],
        histAssets: Partial<Asset>[],
        histLiabilities: Partial<Liability>[],
        histTransactions: Partial<Transaction>[],
        goals: Goal[]
    } | null>(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [refreshCounter, setRefreshCounter] = useState(0)

    const refresh = useCallback(() => {
        setRefreshCounter(prev => prev + 1)
    }, [])

    useEffect(() => {
        const handleDataChange = () => refresh()
        window.addEventListener('lifecc-data-changed', handleDataChange)
        return () => window.removeEventListener('lifecc-data-changed', handleDataChange)
    }, [refresh])

    useEffect(() => {
        let isMounted = true

        async function fetchData() {
            try {
                if (!user) {
                    if (isMounted) {
                        setRawData({
                            assets: [],
                            liabilities: [],
                            transactions: [],
                            shifts: [],
                            health: [],
                            histAssets: [],
                            histLiabilities: [],
                            histTransactions: [],
                            goals: []
                        })
                        setLoading(false)
                    }
                    return
                }

                setLoading(true)
                setError(null)

                const start = startOfMonth(monthDate)
                const end = endOfMonth(monthDate)
                const historyStart = startOfMonth(subMonths(monthDate, 5))
                const applyFilter = (query: any) => {
                    let scopedQuery = query.eq('user_id', user.id)
                    if (selectedProfileId !== 'all') {
                        scopedQuery = scopedQuery.eq('profile_id', selectedProfileId)
                    }
                    return scopedQuery
                }

                const [assetsRes, liabilitiesRes, transactionsRes, shiftsRes, healthRes] = await Promise.all([
                    applyFilter(supabase.from('assets').select('*')).gte('date_reference', start.toISOString()).lte('date_reference', end.toISOString()),
                    applyFilter(supabase.from('liabilities').select('*')).gte('date_reference', start.toISOString()).lte('date_reference', end.toISOString()),
                    applyFilter(supabase.from('transactions').select('*')).gte('date', start.toISOString()).lte('date', end.toISOString()),
                    applyFilter(supabase.from('shifts').select('*')),
                    applyFilter(supabase.from('health_metrics').select('workouts, date, profile_id')).gte('date', start.toISOString()).lte('date', end.toISOString())
                ])

                const [histAssetsRes, histLiabilitiesRes, histTransactionsRes, goalsRes] = await Promise.all([
                    applyFilter(supabase.from('assets').select('value, date_reference'))
                        .gte('date_reference', historyStart.toISOString()).lte('date_reference', end.toISOString()),
                    applyFilter(supabase.from('liabilities').select('value, date_reference'))
                        .gte('date_reference', historyStart.toISOString()).lte('date_reference', end.toISOString()),
                    applyFilter(supabase.from('transactions').select('amount, date, type'))
                        .gte('date', historyStart.toISOString()).lte('date', end.toISOString()),
                    applyFilter(supabase.from('goals').select('*'))
                        .eq('scope', selectedProfileId === 'all' ? 'joint' : 'individual')
                        .order('created_at', { ascending: false })
                        .limit(1)
                ])

                if (assetsRes.error) throw assetsRes.error
                if (liabilitiesRes.error) throw liabilitiesRes.error
                if (transactionsRes.error) throw transactionsRes.error
                if (shiftsRes.error) throw shiftsRes.error
                if (healthRes.error) throw healthRes.error

                if (histAssetsRes.error) throw histAssetsRes.error
                if (histLiabilitiesRes.error) throw histLiabilitiesRes.error
                if (histTransactionsRes.error) throw histTransactionsRes.error
                if (goalsRes.error) throw goalsRes.error

                if (isMounted) {
                    setRawData({
                        assets: assetsRes.data || [],
                        liabilities: liabilitiesRes.data || [],
                        transactions: transactionsRes.data || [],
                        shifts: shiftsRes.data || [],
                        health: healthRes.data || [],
                        histAssets: histAssetsRes.data || [],
                        histLiabilities: histLiabilitiesRes.data || [],
                        histTransactions: histTransactionsRes.data || [],
                        goals: (goalsRes.data as any[]) || []
                    })
                }
            } catch (err: any) {
                console.error('Error fetching dashboard data:', err)
                if (isMounted) {
                    setError(err.message || 'Não foi possível carregar os dados do painel. Verifique sua conexão.')
                }
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        fetchData()

        return () => {
            isMounted = false
        }
    }, [monthDate, selectedProfileId, refreshCounter, user])

    const data = useMemo<DashboardData | null>(() => {
        if (!rawData) return null

        const { assets, liabilities, transactions, shifts, health, histAssets, histLiabilities, histTransactions, goals } = rawData

        // 1. Current Statistics
        const netWorth = calculateNetWorth(assets, liabilities)
        const { income, balance } = calculateMonthBalance(transactions)
        const totalInvestments = transactions
            .filter(t => t.type === 'expense' && (t.category ?? '').toLowerCase().includes('invest'))
            .reduce((acc, t) => acc + Number(t.amount || 0), 0)
        const investmentRate = calculateInvestmentRate(income, totalInvestments)

        const pendingShifts = shifts.filter(s => s.status !== 'paid')
        const pendingShiftsValue = pendingShifts.reduce((acc, s) => acc + Number(s.value_expected || 0), 0)
        const pendingShiftsCount = pendingShifts.length

        // 2. Real History 6 months
        const history: HistoricalPoint[] = []
        for (let i = 5; i >= 0; i--) {
            const date = subMonths(monthDate, i)
            const monthPrefix = format(date, 'yyyy-MM')

            const mAssets = histAssets
                .filter(a => a.date_reference?.startsWith(monthPrefix))
                .reduce((acc, a) => acc + Number(a.value || 0), 0)

            const mLiabs = histLiabilities
                .filter(l => l.date_reference?.startsWith(monthPrefix))
                .reduce((acc, l) => acc + Number(l.value || 0), 0)

            const mIncomes = histTransactions
                .filter(t => t.type === 'income' && t.date?.startsWith(monthPrefix))
                .reduce((acc, t) => acc + Number(t.amount || 0), 0)

            const mExpenses = histTransactions
                .filter(t => t.type === 'expense' && t.date?.startsWith(monthPrefix))
                .reduce((acc, t) => acc + Number(t.amount || 0), 0)

            history.push({
                month: format(date, 'MMM'),
                netWorth: mAssets - mLiabs,
                income: mIncomes,
                expense: mExpenses
            })
        }

        // 3. Analytics
        const topCategories = calculateTopCategories(transactions)
        const upcomingReceipts = shifts
            .filter(s => s.status !== 'paid' && s.payment_due_date)
            .sort((a, b) => new Date(a.payment_due_date!).getTime() - new Date(b.payment_due_date!).getTime())
            .slice(0, 5)

        // 4. Goals & Scores
        const mainGoal = goals.length > 0 ? goals[0] : null
        const prevNW = history.length >= 2 ? history[history.length - 2].netWorth : 0
        const nwGrowthPct = calculateNWGrowth(netWorth, prevNW)

        // Performance calculation
        let perfInput = 0
        const totalWorkouts = health.reduce((acc, h) => acc + (h.workouts || 0), 0)
        if (selectedProfileId === 'all' && profiles.length > 0) {
            let sumPerf = 0
            for (const p of profiles) {
                const pWorkouts = health.filter(h => h.profile_id === p.id).reduce((acc, h) => acc + (h.workouts || 0), 0)
                sumPerf += Math.min(12, pWorkouts)
            }
            perfInput = sumPerf / profiles.length
        } else {
            perfInput = totalWorkouts
        }

        const { score, breakdown } = calculateLifeScore(
            investmentRate,
            nwGrowthPct,
            perfInput,
            selectedProfileId === 'all',
            profiles.length
        )

        const profileParticipation = calculateProfileParticipation(
            selectedProfileId === 'all' ? profiles : [],
            assets,
            liabilities,
            netWorth
        )

        return {
            kpis: {
                netWorth,
                investmentRate,
                balance,
                pendingShiftsValue,
                pendingShiftsCount,
                lifeScore: score,
                lifeScoreBreakdown: breakdown
            },
            history,
            topCategories,
            upcomingReceipts,
            mainGoal,
            profileParticipation
        }
    }, [rawData, monthDate, selectedProfileId, profiles])

    return { data, loading, error, refresh }
}
