/**
 * Utilitários de Projeção e Crescimento
 * Responsável por previsões baseadas em patrimônio e aportes.
 */

/**
 * Calcula a porcentagem de progresso em direção a uma meta
 */
export function calculateGoalProgress(currentNetWorth: number, targetValue: number): number {
    if (targetValue <= 0) return 0
    return Math.floor(Math.min((currentNetWorth / targetValue) * 100, 100))
}

/**
 * Estima o número de meses para atingir uma meta baseada no aporte mensal
 */
export function calculateMonthsToGoal(
    currentNetWorth: number,
    targetValue: number,
    monthlyContribution: number
): number | null {
    if (monthlyContribution <= 0) return null
    const remaining = targetValue - currentNetWorth
    if (remaining <= 0) return 0
    return Math.ceil(remaining / monthlyContribution)
}

/**
 * Calcula a porcentagem de crescimento patrimonial entre dois períodos
 */
export function calculateNWGrowth(currentNW: number, previousNW: number): number {
    if (previousNW <= 0) return (previousNW === 0 && currentNW > 0) ? 10 : 0
    return ((currentNW - previousNW) / previousNW) * 100
}
