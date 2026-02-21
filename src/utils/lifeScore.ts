/**
 * Lógica de Cálculo do Life Score Alpha
 * Define a performance baseada em Finanças, Patrimônio e Saúde.
 */

export interface LifeScoreBreakdown {
    finance: number
    patrimonio: number
    performance: number
}

/**
 * Calcula o Life Score (0-100) baseado em métricas processadas.
 */
export function calculateLifeScore(
    investmentRate: number,
    nwGrowthPct: number,
    workouts: number,
    isCoupleMode: boolean,
    profileCount: number
): { score: number; breakdown: LifeScoreBreakdown } {
    let financeScore = 0
    let nwScore = 0
    let perfScore = 0

    // Safety checks against NaN/Infinity
    if (isNaN(investmentRate) || !isFinite(investmentRate)) investmentRate = 0
    if (isNaN(nwGrowthPct) || !isFinite(nwGrowthPct)) nwGrowthPct = 0
    if (isNaN(workouts) || !isFinite(workouts)) workouts = 0

    // 1. Finance Score (Max 60): baseado na taxa de investimento
    // Benchmark: 30% investment rate = 60 pontos
    financeScore = (investmentRate >= 30)
        ? 60
        : (investmentRate >= 20)
            ? 40 + ((investmentRate - 20) / 10) * 20
            : (investmentRate / 10) * 20

    // 2. NW Score (Max 25): baseado no crescimento patrimonial
    // Benchmark: 2% crescimento mensal = 25 pontos
    nwScore = (nwGrowthPct >= 2)
        ? 25
        : (nwGrowthPct >= 1)
            ? 15 + (nwGrowthPct - 1) * 10
            : (nwGrowthPct > 0)
                ? (nwGrowthPct * 15)
                : 0

    // 3. Performance Score (Max 15): baseado em treinos
    // Benchmark: 12 treinos/mês = 15 pontos
    if (isCoupleMode && profileCount > 0) {
        // Para modo casal, o valor de 'workouts' já deve ser a média consolidada
        perfScore = calculatePerformanceFromCount(workouts)
    } else {
        perfScore = calculatePerformanceFromCount(workouts)
    }

    const totalScore = Math.max(0, Math.min(100, Math.round(financeScore + nwScore + perfScore)))

    return {
        score: totalScore,
        breakdown: {
            finance: Math.round(financeScore),
            patrimonio: Math.round(nwScore),
            performance: Math.round(perfScore)
        }
    }
}

/**
 * Helper para converter contagem de treinos em pontos (0-15)
 */
function calculatePerformanceFromCount(count: number): number {
    if (!count || count <= 0) return 0
    return (count >= 12) ? 15 : (count >= 8) ? 10 : (count >= 4) ? 5 : (count * 1.25)
}
