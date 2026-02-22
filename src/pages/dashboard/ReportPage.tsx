import { useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { TrendingUp, Calendar, Activity, ShieldCheck, PieChart } from 'lucide-react'

import { useDashboardData } from '../../hooks/useDashboardData'
import { useFilter } from '../../hooks/useFilter'
import { formatCurrency } from '../../utils/utils'

export function ReportPage() {
    const { selectedProfileId, profiles } = useFilter()
    const { data, loading, error } = useDashboardData()

    useEffect(() => {
        if (!loading && data && !error) {
            const timer = setTimeout(() => {
                window.print()
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [loading, data, error])

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <p className="text-zinc-500 font-semibold uppercase tracking-widest text-xs">Gerando Relatório Executivo...</p>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white text-center px-4">
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Erro ao Gerar Relatório</h2>
                <p className="text-zinc-500 text-sm max-w-sm mb-6">{error || 'Dados não disponíveis.'}</p>
                <button
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-brand text-white rounded-lg text-xs font-semibold"
                >
                    Voltar
                </button>
            </div>
        )
    }

    const { kpis, history = [], topCategories = [], upcomingReceipts = [] } = data
    const activeProfileName = profiles.find((p: any) => p.id === selectedProfileId)?.name
    const generationDate = new Date()

    return (
        <div className="bg-white min-h-screen p-8 max-w-4xl mx-auto space-y-10 print:p-0 text-zinc-900">
            {/* Header Relatório */}
            <div className="flex justify-between items-end border-b-2 border-zinc-900 pb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight uppercase">
                        LifeCC — Relatório {selectedProfileId === 'all' ? 'Consolidado' : `de ${activeProfileName}`}
                    </h1>
                    <p className="text-zinc-500 font-semibold uppercase tracking-widest text-[10px] mt-1">
                        Referência: {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Data de Geração</p>
                    <p className="text-xs font-bold text-zinc-900">{format(generationDate, "dd 'de' MMMM, yyyy", { locale: ptBR })}</p>
                </div>
            </div>

            {/* Resumo Executivo */}
            <div className="grid grid-cols-3 gap-6">
                <div className="p-5 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Patrimônio Líquido</p>
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{formatCurrency(kpis.netWorth)}</h3>
                </div>
                <div className="p-5 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Life Score Alpha</p>
                    <div className="flex items-baseline gap-1.5">
                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{kpis.lifeScore}</h3>
                        <span className="text-[11px] font-semibold text-zinc-500">/ 100</span>
                    </div>
                </div>
                <div className="p-5 border border-zinc-200 rounded-lg bg-zinc-50/50">
                    <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Taxa de Investimento</p>
                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{kpis.investmentRate.toFixed(1)}%</h3>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
                {/* Coluna Esquerda: Finanças */}
                <div className="space-y-10">
                    <section className="space-y-5">
                        <h3 className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase flex items-center gap-2 border-b border-zinc-200 pb-2">
                            <TrendingUp size={14} className="text-zinc-500" /> Evolução Patrimonial
                        </h3>
                        <div className="h-32 flex items-end gap-2 px-2">
                            {history.map((h: any, i: number) => {
                                const maxNW = Math.max(...history.map((x: any) => x.netWorth), 1)
                                const height = 10 + (h.netWorth / maxNW) * 90
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-zinc-100 rounded-t-md relative h-full flex items-end">
                                            <div className="w-full bg-zinc-800 rounded-t-sm" style={{ height: `${height}%` }} />
                                        </div>
                                        <span className="text-[9px] font-semibold text-zinc-500 uppercase">{h.month}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    <section className="space-y-5">
                        <h3 className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase flex items-center gap-2 border-b border-zinc-200 pb-2">
                            <PieChart size={14} className="text-zinc-500" /> Principais Gastos
                        </h3>
                        <div className="space-y-3">
                            {topCategories.map((cat: any) => (
                                <div key={cat.name} className="flex justify-between items-center text-xs font-medium border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                                    <span className="text-zinc-600 uppercase tracking-wider">{cat.name}</span>
                                    <span className="font-semibold text-zinc-900">{formatCurrency(cat.value)}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Coluna Direita: Plantões e Performance */}
                <div className="space-y-10">
                    <section className="space-y-5">
                        <h3 className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase flex items-center gap-2 border-b border-zinc-200 pb-2">
                            <Calendar size={14} className="text-zinc-500" /> Plantões Pendentes
                        </h3>
                        <div className="space-y-3">
                            {upcomingReceipts.map((shift: any) => (
                                <div key={shift.id} className="flex justify-between items-center text-xs border-b border-zinc-100 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-semibold text-zinc-800 uppercase">{shift.place}</p>
                                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{shift.payment_due_date || shift.date}</p>
                                    </div>
                                    <p className="font-bold text-zinc-900">{formatCurrency(shift.value_expected)}</p>
                                </div>
                            ))}
                            <div className="pt-3 flex justify-between items-center bg-zinc-50 px-3 py-2 rounded-md">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Total Previsto</span>
                                <span className="text-sm font-bold text-zinc-900">{formatCurrency(kpis.pendingShiftsValue)}</span>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-5">
                        <h3 className="text-[11px] font-bold text-zinc-900 tracking-widest uppercase flex items-center gap-2 border-b border-zinc-200 pb-2">
                            <Activity size={14} className="text-zinc-500" /> Performance de Saúde
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="border border-zinc-200 p-4 rounded-lg text-center bg-zinc-50/50">
                                <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Score Performance</p>
                                <p className="text-xl font-bold text-zinc-900">{kpis.lifeScoreBreakdown.performance}/15</p>
                            </div>
                            <div className="border border-zinc-200 p-4 rounded-lg text-center bg-zinc-50/50">
                                <p className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Situação</p>
                                <p className="text-[11px] font-bold text-zinc-900 mt-2">{kpis.lifeScoreBreakdown.performance > 0 ? "Ativo" : "Inativo"}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Footer Relatório */}
            <div className="pt-8 mt-10 border-t border-zinc-200 flex justify-between items-center">
                <div className="flex items-center gap-2 text-zinc-400">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-widest">LifeCC Alpha Secured</span>
                </div>
                <p className="text-[9px] text-zinc-500 font-medium">Relatório confidencial gerado via LifeCC Executive Dashboard.</p>
            </div>

            <div className="fixed bottom-8 right-8 no-print">
                <button
                    onClick={() => window.history.back()}
                    className="px-5 py-2.5 bg-brand text-white rounded-lg text-xs font-semibold shadow-xl hover:bg-brand/90 transition-all active:scale-95"
                >
                    Voltar ao Dashboard
                </button>
            </div>
        </div>
    )
}
