export interface KPIBreakdown {
    finance: number
    patrimonio: number
    performance: number
}

export interface DashboardKPIs {
    netWorth: number
    investmentRate: number
    balance: number
    pendingShiftsValue: number
    pendingShiftsCount: number
    lifeScore: number
    lifeScoreBreakdown: KPIBreakdown
}

export interface HistoricalPoint {
    month: string
    netWorth: number
    income: number
    expense: number
}

export interface CategoryData {
    name: string
    value: number
}

export interface ProfileParticipation {
    name: string
    value: number
    percentage: number
}

export interface DashboardData {
    kpis: DashboardKPIs
    history: HistoricalPoint[]
    topCategories: CategoryData[]
    upcomingReceipts: any[]
    mainGoal: any | null
    profileParticipation: ProfileParticipation[]
}
