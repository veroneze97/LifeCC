import { Link } from 'react-router-dom'
import {
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    Calendar,
    PieChart,
    Zap,
    TrendingUp,
    Info,
    FileText,
    AlertCircle
} from 'lucide-react'

import { useDashboardData } from '../../hooks/useDashboardData'
import { useFilter } from '../../hooks/useFilter'
import { formatCurrency, cn } from '../../utils/utils'
import { calculateGoalProgress, calculateMonthsToGoal } from '../../utils/projections'

export function DashboardPage() {
    const { selectedProfileId, profiles } = useFilter()
    const { data, loading, error, refresh } = useDashboardData()

    if (loading) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="relative">
                    <div className="w-12 h-12 border-[3px] border-border rounded-full animate-spin border-t-brand" />
                    <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand animate-pulse" size={16} />
                </div>
                <p className="text-muted font-semibold uppercase tracking-widest text-[10px]">Preparando seu Dashboard...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Não foi possível carregar seu Dashboard</h2>
                <p className="text-muted text-sm max-w-sm mb-8">
                    {error || 'Houve um problema ao conectar com nossos serviços. Por favor, verifique sua conexão ou tente novamente.'}
                </p>
                <button
                    onClick={() => refresh()}
                    className="px-8 py-3 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-950/20 active:scale-95"
                >
                    Tentar Novamente
                </button>
            </div>
        )
    }

    if (!data) return null

    const { kpis, history = [], topCategories = [], upcomingReceipts = [] } = data
    const activeProfile = profiles.find((p: any) => p.id === selectedProfileId)

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {selectedProfileId === 'all' ? 'Visão Consolidada' : `Dashboard de ${activeProfile?.name || 'Perfil'}`}
                    </h1>
                    <p className="text-muted text-sm font-medium mt-1">Sua inteligência financeira {selectedProfileId === 'all' ? 'do casal' : 'individual'} em tempo real.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/report"
                        className="px-5 py-2 bg-foreground text-background rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-muted transition-all shadow-sm active:scale-95"
                    >
                        <FileText size={14} /> Relatório Executivo
                    </Link>
                    <div className="px-4 py-2 bg-positive/10 text-positive rounded-lg text-xs font-semibold flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse" />
                        Sistemas Online
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* KPI: Patrimônio Líquido */}
                <div className="premium-card p-6 group">
                    <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-2">Patrimônio Líquido</p>
                    <h3 className="text-3xl font-bold text-foreground tracking-tight mb-2">{formatCurrency(kpis.netWorth)}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-positive">
                            {selectedProfileId === 'all' ? 'Total Consolidado' : 'Patrimônio Individual'}
                        </span>
                    </div>
                </div>

                {/* KPI: Meta Principal */}
                <div className="premium-card p-6 group flex flex-col justify-between">
                    <div>
                        <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-2">Meta Principal</p>
                        {data.mainGoal ? (
                            <>
                                <h3 className="text-xl font-bold text-foreground mb-1">{data.mainGoal.name}</h3>
                                <p className="text-xs font-medium text-muted flex items-center gap-2">
                                    Status: {calculateGoalProgress(kpis.netWorth, data.mainGoal.target_value)}% concluído
                                </p>

                                <div className="mt-4 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Tempo Estimado</p>
                                            <p className="text-sm font-semibold text-foreground">
                                                {calculateMonthsToGoal(kpis.netWorth, data.mainGoal.target_value, data.mainGoal.monthly_contribution) !== null
                                                    ? `${calculateMonthsToGoal(kpis.netWorth, data.mainGoal.target_value, data.mainGoal.monthly_contribution)} meses`
                                                    : 'Defina aporte p/ projetar'
                                                }
                                            </p>
                                        </div>
                                        <TrendingUp size={14} className="text-brand mb-1" />
                                    </div>
                                    <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border">
                                        <div
                                            className="bg-brand h-full transition-all duration-1000"
                                            style={{ width: `${calculateGoalProgress(kpis.netWorth, data.mainGoal.target_value)}%` }}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center py-2 text-center">
                                <p className="text-muted text-xs font-medium mb-3">Nenhuma meta estratégica definida.</p>
                                <button className="text-[11px] font-semibold bg-background px-3 py-1.5 rounded-lg border border-border hover:bg-border transition-all">Definir Agora</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* KPI: Taxa de Investimento */}
                <div className="premium-card p-6 group">
                    <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-2">Taxa de Investimento</p>
                    <div className="flex items-baseline gap-2 mb-3">
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">{kpis.investmentRate.toFixed(1)}%</h3>
                        <TrendingUp size={14} className="text-positive" />
                    </div>
                    <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border">
                        <div
                            className="h-full bg-positive transition-all duration-1000"
                            style={{ width: `${Math.min(kpis.investmentRate, 100)}%` }}
                        />
                    </div>
                </div>

                {/* KPI: Balanço Mensal */}
                <div className="premium-card p-6 group">
                    <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-2">Balanço Mensal</p>
                    <h3 className={cn("text-3xl font-bold tracking-tight mb-2", (kpis.balance ?? 0) >= 0 ? "text-positive" : "text-negative")}>
                        {formatCurrency(kpis.balance ?? 0)}
                    </h3>
                    <div className="flex items-center gap-1.5">
                        {(kpis.balance ?? 0) >= 0 ? <ArrowUpRight size={14} className="text-positive" /> : <ArrowDownRight size={14} className="text-negative" />}
                        <span className="text-xs font-medium text-muted">Resultado do Fluxo</span>
                    </div>
                </div>

                {/* Life Score Alpha */}
                <div className="premium-card p-6 group flex flex-col justify-between relative overflow-hidden h-full">
                    <div className="relative z-10 w-full mb-2">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-gold font-semibold text-[11px] uppercase tracking-wider">Life Score</p>
                            <div className="group/tooltip relative">
                                <Info size={14} className="text-muted cursor-help hover:text-foreground transition-colors" />
                                <div className="absolute right-0 top-6 w-48 bg-card border border-border text-foreground p-3 rounded-lg text-xs font-medium leading-relaxed opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 shadow-lg">
                                    Cálculo baseado em: Taxa de Investimento (60%), Crescimento de Patrimônio (25%) e Consistência de Treinos (15%).
                                </div>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                            <h3 className="text-4xl font-bold text-foreground tracking-tighter">{kpis.lifeScore}</h3>
                            <span className="text-xs font-semibold text-muted">/ 100</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
                                    <span>Financeiro</span>
                                    <span className="text-foreground">{kpis.lifeScoreBreakdown.finance}/60</span>
                                </div>
                                <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                                    <div className="bg-brand h-full transition-all duration-1000" style={{ width: `${(kpis.lifeScoreBreakdown.finance / 60) * 100}%` }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
                                    <span>Patrimônio</span>
                                    <span className="text-foreground">{kpis.lifeScoreBreakdown.patrimonio}/25</span>
                                </div>
                                <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                                    <div className="bg-positive h-full transition-all duration-1000" style={{ width: `${(kpis.lifeScoreBreakdown.patrimonio / 25) * 100}%` }} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted">
                                    <span>Performance</span>
                                    <span className="text-foreground">{kpis.lifeScoreBreakdown.performance}/15</span>
                                </div>
                                <div className="w-full bg-background h-1 rounded-full overflow-hidden">
                                    <div className="bg-gold h-full transition-all duration-1000" style={{ width: `${(kpis.lifeScoreBreakdown.performance / 15) * 100}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="premium-card p-6 group flex flex-col justify-center">
                    <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-2">Capital em Trânsito</p>
                    <h3 className="text-3xl font-bold text-foreground tracking-tight mb-2">{formatCurrency(kpis.pendingShiftsValue)}</h3>
                    <p className="text-[11px] font-medium text-muted">{kpis.pendingShiftsCount} faturas pendentes</p>
                </div>

                {selectedProfileId === 'all' && data.profileParticipation && (
                    <div className="premium-card p-6 group flex flex-col justify-between relative overflow-hidden lg:col-span-2">
                        <div>
                            <p className="text-muted font-semibold text-[11px] uppercase tracking-wider mb-4">Participação Patrimonial</p>
                            <div className="space-y-4">
                                {data.profileParticipation.map((p: any, i: number) => (
                                    <div key={p.name} className="space-y-1.5">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-semibold text-foreground">{p.name}</span>
                                            <span className="text-xs font-semibold text-foreground">{p.percentage.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                                            <div
                                                className={cn(
                                                    "h-full rounded-full transition-all duration-1000",
                                                    i === 0 ? "bg-brand" : "bg-muted"
                                                )}
                                                style={{ width: `${Math.max(p.percentage, 0)}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <div className="premium-card p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-lg font-semibold text-foreground tracking-tight">Evolução de Patrimônio</h3>
                                <p className="text-[11px] text-muted font-medium mt-0.5">Série Histórica Personalizada</p>
                            </div>
                        </div>
                        <div className="h-56 flex items-end gap-2">
                            {history.map((h: any, i: number) => {
                                const maxNW = Math.max(...history.map((x: any) => x.netWorth), 1)
                                const height = 10 + (h.netWorth / maxNW) * 90
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                        <div className="w-full bg-background rounded-lg relative overflow-hidden h-full flex items-end border border-transparent hover:border-border transition-colors">
                                            <div
                                                className="w-full bg-brand/80 rounded-t-md transition-all duration-700 group-hover:bg-brand"
                                                style={{ height: `${height}%` }}
                                            />
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border text-foreground text-[10px] font-semibold px-2 py-1 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100 whitespace-nowrap z-20 pointer-events-none">
                                                {formatCurrency(h.netWorth)}
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-medium text-muted">{h.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="premium-card p-6">
                            <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                <PieChart size={14} className="text-muted" /> Distribuição de Gastos
                            </h3>
                            <div className="space-y-5">
                                {topCategories.map((cat: any) => {
                                    const maxValue = topCategories[0]?.value || 1
                                    return (
                                        <div key={cat.name} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[11px] font-medium text-muted">{cat.name}</span>
                                                <span className="text-xs font-semibold text-foreground">{formatCurrency(cat.value)}</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border">
                                                <div
                                                    className="h-full bg-brand/60 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(cat.value / maxValue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                                {topCategories.length === 0 && <p className="text-xs text-muted italic py-4">Nenhum dado analítico disponível.</p>}
                            </div>
                        </div>

                        <div className="premium-card p-6">
                            <h3 className="text-[11px] font-semibold text-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Activity size={14} className="text-muted" /> Fluxo de Caixa (6M)
                            </h3>
                            <div className="h-32 flex items-end gap-1.5">
                                {history.map((h: any, i: number) => {
                                    const maxIncome = Math.max(...history.map((x: any) => x.income), 1)
                                    const maxExpense = Math.max(...history.map((x: any) => x.expense), 1)
                                    return (
                                        <div key={i} className="flex-1 flex gap-0.5 items-end h-full">
                                            <div className="flex-1 bg-positive/40 hover:bg-positive/60 transition-colors rounded-t-sm" style={{ height: `${(h.income / maxIncome) * 100}%` }} />
                                            <div className="flex-1 bg-negative/40 hover:bg-negative/60 transition-colors rounded-t-sm" style={{ height: `${(h.expense / maxExpense) * 100}%` }} />
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-4 flex gap-3 text-[10px]">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-positive/60" />
                                    <span className="font-semibold text-muted uppercase tracking-wider">Receita</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-negative/60" />
                                    <span className="font-semibold text-muted uppercase tracking-wider">Despesa</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="premium-card p-6">
                        <h3 className="text-lg font-semibold text-foreground tracking-tight mb-6">Faturamento Futuro</h3>
                        <div className="space-y-4">
                            {upcomingReceipts.map((shift: any) => (
                                <div key={shift.id} className="flex items-center justify-between group hover:bg-background -mx-2 px-2 py-1.5 rounded-lg transition-colors cursor-default">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-background rounded-lg flex items-center justify-center border border-border group-hover:border-brand/30 transition-colors">
                                            <Calendar size={16} className="text-muted group-hover:text-brand transition-colors" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-foreground uppercase tracking-tight">{shift.place}</h4>
                                            <p className="text-[10px] text-muted font-medium mt-0.5">{shift.payment_due_date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-foreground">{formatCurrency(shift.value_expected)}</p>
                                        <span className="text-[9px] px-1.5 py-0.5 bg-background border border-border text-muted rounded uppercase tracking-wider mt-0.5 inline-block">Previsto</span>
                                    </div>
                                </div>
                            ))}
                            {upcomingReceipts.length === 0 && (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-12 h-12 bg-background border border-border rounded-full flex items-center justify-center mx-auto text-muted/50">
                                        <Calendar size={20} />
                                    </div>
                                    <p className="text-[10px] font-medium text-muted uppercase tracking-wider">Nenhum recebimento agendado</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="premium-card p-6 bg-[#1a1d24] border-brand/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-lg font-semibold text-brand tracking-tight mb-2 flex items-center gap-2">
                                <Zap size={16} /> LifeCC Insight
                            </h3>
                            <p className="text-muted text-sm leading-relaxed mb-6">
                                Seu fluxo de caixa está <span className="text-positive font-medium">12% mais eficiente</span> que no mês passado. Considere aumentar seu aporte em renda variável em 5%.
                            </p>
                            <Link to="/report" className="block w-full text-center py-2.5 bg-brand text-white rounded-lg text-xs font-semibold hover:bg-brand/90 transition-all active:scale-95 shadow-sm">
                                Ver Relatório Detalhado
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
