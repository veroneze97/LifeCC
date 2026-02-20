import { Search, Plus, Filter, MoreHorizontal, PieChart, BarChart2, Briefcase } from 'lucide-react'
import { formatCurrency } from '../../lib/utils'

const assets = [
    { id: 1, name: 'PETR4', type: 'Ação', amount: 1200, price: 42.50, allocation: 15.4, change: +2.3 },
    { id: 2, name: 'VALE3', type: 'Ação', amount: 800, price: 65.10, allocation: 12.8, change: -1.2 },
    { id: 3, name: 'HGLG11', type: 'FII', amount: 2500, price: 165.20, allocation: 25.0, change: +0.5 },
    { id: 4, name: 'KNIP11', type: 'FII', amount: 3000, price: 92.40, allocation: 18.2, change: -0.1 },
    { id: 5, name: 'Cotas Fundo X', type: 'Multimercado', amount: 50000, price: 1.0, allocation: 28.6, change: +1.1 },
]

export function PortfolioPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Portfolio Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-950 tracking-tight">Patrimônio</h1>
                    <p className="text-zinc-500 font-medium mt-1">Gestão detalhada e alocação de ativos.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar ativo..."
                            className="h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all w-64"
                        />
                    </div>
                    <button className="h-10 px-6 bg-zinc-950 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200">
                        <Plus size={18} />
                        Adicionar Ativo
                    </button>
                </div>
            </header>

            {/* Allocation Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/50 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <PieChart size={28} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Alocação Meta</p>
                        <h4 className="text-xl font-bold text-zinc-900 tracking-tight">Em Conformidade</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/50 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <BarChart2 size={28} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Ativos Totais</p>
                        <h4 className="text-xl font-bold text-zinc-900 tracking-tight">42 Ativos Cadastrados</h4>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200/50 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-zinc-50 text-zinc-600 rounded-2xl flex items-center justify-center">
                        <Briefcase size={28} />
                    </div>
                    <div>
                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Custódia</p>
                        <h4 className="text-xl font-bold text-zinc-900 tracking-tight">XP, BTG e Santander</h4>
                    </div>
                </div>
            </div>

            {/* Assets Table */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-200/50 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Listagem de Ativos</h3>
                    <button className="flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-950 transition-all">
                        <Filter size={16} /> Ver Filtrados
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Ativo / Classe</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Qtd / Preço Médio</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alocação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Saldo Atual</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-zinc-50/30 transition-all group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900 font-bold text-xs group-hover:bg-zinc-950 group-hover:text-white transition-all">
                                                {asset.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-zinc-900">{asset.name}</p>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{asset.type}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-zinc-900">{asset.amount} <span className="text-xs text-zinc-400">unids</span></p>
                                        <p className="text-xs text-zinc-500 font-medium">PM: {formatCurrency(asset.price)}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="w-24">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-[10px] font-bold text-zinc-500">{asset.allocation}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-zinc-950 rounded-full"
                                                    style={{ width: `${asset.allocation * 2}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right font-black text-zinc-900">
                                        {formatCurrency(asset.amount * asset.price)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-3 text-zinc-400">
                                            <button className="hover:text-zinc-950 transition-all"><BarChart2 size={16} /></button>
                                            <button className="hover:text-zinc-950 transition-all"><MoreHorizontal size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-6 bg-zinc-50/30 border-t border-zinc-100 text-center">
                    <button className="text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-black transition-all">
                        Carregar Mais Ativos
                    </button>
                </div>
            </div>
        </div>
    )
}
