import { TrendingUp, Target, Zap, PieChart } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'

export function PerformancePage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="pb-6 border-b border-zinc-200/60">
                <h1 className="text-4xl font-bold text-zinc-950 tracking-tight">Performance Analytics</h1>
                <p className="text-zinc-500 font-medium mt-1">Análise de rentabilidade e metas de longo prazo.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Alpha Card */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-zinc-950 p-10 rounded-[3rem] text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Alpha Report - Fevereiro 2026</span>
                            </div>
                            <h2 className="text-5xl font-black tracking-tighter mb-4">Seu rendimento superou o CDI em <span className="text-emerald-400">142%</span></h2>
                            <p className="text-zinc-400 text-lg max-w-lg mb-10">Sua estratégia focada em FIIs e ativismo em Small Caps gerou um prêmio de risco significativo este mês.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-8">
                                {[
                                    { label: 'Yield On Cost', value: '8.4%' },
                                    { label: 'Lucro Realizado', value: formatCurrency(2450) },
                                    { label: 'Volatilidade', value: '1.2%' },
                                    { label: 'Drawdown', value: '0.4%' },
                                ].map(item => (
                                    <div key={item.label}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">{item.label}</p>
                                        <p className="text-xl font-bold">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Zap size={180} className="absolute -right-10 -top-10 text-white/[0.03] -rotate-12" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Target size={20} />
                                </div>
                                <h3 className="text-lg font-bold">Meta de Patrimônio</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-500 font-medium">Progresso</span>
                                    <span className="font-bold text-zinc-950">R$ 284k / R$ 500k</span>
                                </div>
                                <div className="h-4 w-full bg-zinc-50 rounded-full border border-zinc-100 p-1">
                                    <div className="h-full w-[57%] bg-zinc-950 rounded-full" />
                                </div>
                                <p className="text-xs text-zinc-400 font-medium text-center italic">Você está 12 meses à frente do plano original.</p>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/50 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                    <TrendingUp size={20} />
                                </div>
                                <h3 className="text-lg font-bold">Smart Alerts</h3>
                            </div>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5" />
                                    <p className="text-xs text-zinc-600 leading-relaxed"><span className="font-bold text-zinc-950">Rebalanceamento:</span> Sua alocação em FIIs ultrapassou o teto de 25%.</p>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5" />
                                    <p className="text-xs text-zinc-600 leading-relaxed"><span className="font-bold text-zinc-950">Yield:</span> Proventos da VALE3 caíram na conta ontem.</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Breakdown side */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200/50 shadow-sm h-full">
                        <h3 className="text-xl font-bold mb-8">Asset Breakdown</h3>
                        <div className="space-y-8">
                            {[
                                { label: 'Ações BR', value: '42%', color: 'bg-zinc-950' },
                                { label: 'FIIs', value: '38%', color: 'bg-zinc-600' },
                                { label: 'Tesouro Direto', value: '15%', color: 'bg-zinc-300' },
                                { label: 'Liquidez', value: '5%', color: 'bg-zinc-100' },
                            ].map(item => (
                                <div key={item.label} className="space-y-2">
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-zinc-500">
                                        <span>{item.label}</span>
                                        <span className="text-zinc-950">{item.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-zinc-50 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", item.color)} style={{ width: item.value }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <PieChart className="text-zinc-200 mx-auto mb-4" size={48} />
                            <p className="text-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">IA Insight</p>
                            <p className="text-center text-xs text-zinc-600 mt-2">Sua carteira está defensiva para o cenário atual de juros.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
