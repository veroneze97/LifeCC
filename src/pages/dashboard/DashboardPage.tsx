import { TrendingUp, Wallet, ArrowUpRight, Plus, Calendar } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

export function DashboardPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Overview Financeiro</h1>
                    <p className="text-zinc-500">Acompanhe seu desempenho e próximos turnos.</p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-all flex items-center gap-2">
                        Exportar Dados
                    </button>
                    <button className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-sm">
                        <Plus size={16} />
                        Novo Turno
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Assets Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <Wallet size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                            +4.2% <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-zinc-500 text-sm mb-1">Patrimônio Total</p>
                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{formatCurrency(154200)}</h3>
                    </div>
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-zinc-50 rounded-full group-hover:scale-150 transition-transform duration-500" />
                </div>

                {/* Monthly Performance Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-600">
                            <TrendingUp size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold bg-emerald-50 px-2 py-1 rounded-full">
                            +12.8% <ArrowUpRight size={12} />
                        </span>
                    </div>
                    <div className="relative z-10">
                        <p className="text-zinc-500 text-sm mb-1">Resultado Mensal</p>
                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{formatCurrency(12430)}</h3>
                    </div>
                </div>

                {/* Next Shift Card */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm col-span-1 md:col-span-2">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-950 text-white rounded-2xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-zinc-500 text-sm">Próximo Turno Agendado</p>
                            <h3 className="text-xl font-bold text-zinc-900">Amanhã, 12:00 - 24:00 (12h)</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-zinc-100 p-8 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold">Performance de Ativos</h3>
                        <div className="flex gap-2">
                            {['7D', '1M', '3M', 'All'].map(t => (
                                <button key={t} className="px-3 py-1 text-xs font-medium text-zinc-500 hover:bg-zinc-100 rounded-lg transition-all">
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center h-[280px] border-2 border-dashed border-zinc-100 rounded-2xl text-zinc-400">
                        <TrendingUp size={48} className="mb-4 opacity-20" />
                        <p className="text-sm">Aguardando primeiros lançamentos para gerar o gráfico.</p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-zinc-100 p-8">
                    <h3 className="text-xl font-bold mb-6">Últimos Lançamentos</h3>
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between group cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                        <TrendingUp size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-zinc-900">Lucro Operação DayTrade</h4>
                                        <p className="text-xs text-zinc-500">Há 2 horas • Receita</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-emerald-600">+{formatCurrency(450)}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-3 text-sm font-semibold text-zinc-500 hover:text-black hover:bg-zinc-50 rounded-2xl transition-all">
                        Ver Todo o Histórico
                    </button>
                </div>
            </div>
        </div>
    )
}
