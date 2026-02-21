/**
 * Utilitários de Cálculos Financeiros
 * Centraliza a lógica de agregação e métricas de patrimônio.
 */

interface ProfileParticipation {
    name: string
    value: number
    percentage: number
}

/**
 * Calcula o Patrimônio Líquido atual (Ativos - Passivos)
 */
export function calculateNetWorth(assets: any[], liabilities: any[]): number {
    const totalAssets = assets.reduce((acc, item) => acc + Number(item.value || 0), 0)
    const totalLiabilities = liabilities.reduce((acc, item) => acc + Number(item.value || 0), 0)
    return totalAssets - totalLiabilities
}

/**
 * Calcula o balanço mensal de entradas e saídas
 */
export function calculateMonthBalance(transactions: any[]): { income: number; expense: number; balance: number } {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    const expense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + Number(t.amount || 0), 0)

    return { income, expense, balance: income - expense }
}

/**
 * Calcula a taxa de investimento (Investimentos / Receita)
 */
export function calculateInvestmentRate(income: number, totalInvestments: number): number {
    if (income <= 0) return 0
    return Math.max(0, Math.min(100, (totalInvestments / income) * 100))
}

/**
 * Agrupa gastos por categoria e retorna os top N
 */
export function calculateTopCategories(transactions: any[], limit = 5): { name: string; value: number }[] {
    const categoriesMap: Record<string, number> = {}

    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            const category = t.category || 'Outros'
            categoriesMap[category] = (categoriesMap[category] || 0) + Number(t.amount || 0)
        })

    return Object.entries(categoriesMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, limit)
}

/**
 * Calcula a participação de cada perfil no patrimônio líquido consolidado
 */
export function calculateProfileParticipation(
    profiles: any[],
    assets: any[],
    liabilities: any[],
    totalNetWorth: number
): ProfileParticipation[] {
    if (!totalNetWorth || totalNetWorth === 0) return profiles.map(p => ({ name: p.name, value: 0, percentage: 0 }))

    return profiles.map(p => {
        const pAssets = assets.filter(a => a.profile_id === p.id).reduce((acc, item) => acc + Number(item.value || 0), 0)
        const pLiabilities = liabilities.filter(l => l.profile_id === p.id).reduce((acc, item) => acc + Number(item.value || 0), 0)
        const pNW = pAssets - pLiabilities

        return {
            name: p.name,
            value: pNW,
            percentage: Math.max(0, (pNW / totalNetWorth) * 100)
        }
    })
}
