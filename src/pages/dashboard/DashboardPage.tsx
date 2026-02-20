import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus, Calendar, Filter, Download } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'

export function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Executive Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm font-medium mb-1">
                        <Calendar size={14} />
                        <span>19 de Fevereiro, 2026</span>
                    </div>
                    <h1 className="text-4xl font-bold text-zinc-950 tracking-tight">Financial Overview</h1>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm">
                        <Filter size={16} />
                        Filtros
                    </button>
                    <button className="h-10 px-4 border border-zinc-200 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-all flex items-center gap-2">
                        <Download size={16} />
                    </button>
                    <button className="h-10 px-6 bg-zinc-950 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200">
                        <Plus size={18} />
                        Novo Lançamento
                    </button>
                </div>
            </header>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Net Worth Card */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-200/50 shadow-sm relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-zinc-500 font-medium text-sm mb-2">Patrimônio Consolidado</p>
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-4xl font-black text-zinc-950 tracking-tighter">{formatCurrency(284950)}</h3>
                            <span className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold">
                                <ArrowUpRight size={14} /> 8.4%
                            </span>
                        </div>
                        <div className="mt-6 flex items-center gap-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center overflow-hidden">
                                        <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-400" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-zinc-400 font-medium">Atualizado há 12 min</p>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 p-8 h-full flex items-center">
                        <Wallet size={120} className="text-zinc-50 opacity-[0.03] rotate-12" />
                    </div>
                </div>

                {/* Monthly ROI card */}
                <div className="bg-zinc-950 p-8 rounded-3xl border border-white/10 shadow-xl relative group">
                    <p className="text-zinc-400 font-medium text-sm mb-2">Resultado Líquido (Mês)</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-4xl font-black text-white tracking-tighter">{formatCurrency(18230.50)}</h3>
                        <span className="flex items-center gap-0.5 text-emerald-400 text-xs font-bold">
                            <ArrowUpRight size={14} /> 12.1%
                        </span>
                    </div>
                    <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    </div>
                    <p className="mt-2 text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Meta Mensal: 75% atingida</p>
                </div>

                {/* Quick Insights Card */}
                <div className="bg-white p-8 rounded-3xl border border-zinc-200/50 shadow-sm flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <ArrowUpRight size={16} />
                                </div>
                                <span className="text-sm font-semibold text-zinc-700">Renda Passiva</span>
                            </div>
                            <span className="text-sm font-bold">{formatCurrency(3450)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                                    <ArrowDownRight size={16} />
                                </div>
                                <span className="text-sm font-semibold text-zinc-700">Custo de Vida</span>
                            </div>
                            <span className="text-sm font-bold text-rose-600">{formatCurrency(8900)}</span>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-2.5 bg-zinc-50 border border-zinc-100 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-all uppercase tracking-wider">
                        Ver Relatório Completo
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Chart Area */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-200/50 p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-bold text-zinc-950">Curva de Equidade</h3>
                                <p className="text-sm text-zinc-500 font-medium">Evolução do capital líquido nos últimos 6 meses.</p>
                            </div>
                            <div className="flex bg-zinc-50 p-1.5 rounded-2xl border border-zinc-100">
                                {['6M', '1Y', 'ALL'].map(p => (
                                    <button key={p} className={cn(
                                        "px-4 py-1.5 text-xs font-bold rounded-xl transition-all",
                                        p === '6M' ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                                    )}>
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[320px] flex items-center justify-center bg-zinc-50/50 border border-dashed border-zinc-200 rounded-[2rem]">
                            <div className="text-center group cursor-pointer">
                                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 border border-zinc-100 shadow-sm group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp className="text-zinc-400" />
                                </div>
                                <p className="text-sm font-bold text-zinc-950">Aguardando Volume de Dados</p>
                                <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">Os gráficos serão gerados automaticamente assim que houver histórico suficiente.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Side panel: Operations */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-zinc-200/50 p-8 shadow-sm h-full">
                        <h3 className="text-xl font-bold text-zinc-950 mb-8">Fluxo de Caixa</h3>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(idx => (
                                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100/50 group-hover:bg-zinc-950 group-hover:text-white transition-all duration-300">
                                            <TrendingUp size={20} className={idx % 2 === 0 ? "scale-y-[-1] text-rose-500 group-hover:text-rose-400" : "text-emerald-500 group-hover:text-emerald-400"} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-zinc-950 group-hover:translate-x-1 transition-transform">{idx % 2 === 0 ? 'Retirada Dividentos' : 'Aporte FIIs'}</h4>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Ativo: {idx % 2 === 0 ? 'PETR4' : 'HGLG11'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={cn("text-sm font-black", idx % 2 === 0 ? "text-rose-600" : "text-emerald-600")}>
                                            {idx % 2 === 0 ? '-' : '+'}{formatCurrency(idx * 450)}
                                        </p>
                                        <p className="text-[10px] text-zinc-400 font-medium">Ontem</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-10 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-black hover:bg-zinc-100 transition-all">
                            Ver Todas as Operações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
