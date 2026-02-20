import { Search, Filter, Download, MoreHorizontal, Calendar as CalendarIcon } from 'lucide-react'
import { formatCurrency, cn } from '../../lib/utils'

const transactions = [
    { id: 1, date: '2026-02-19', description: 'Dividendo PETR4', category: 'Provento', value: 450.25, type: 'credit', status: 'concluded' },
    { id: 2, date: '2026-02-18', description: 'Aporte HGLG11', category: 'Investimento', value: -1250.00, type: 'debit', status: 'concluded' },
    { id: 3, date: '2026-02-17', description: 'Taxa Custódia', category: 'Taxa', value: -12.50, type: 'debit', status: 'concluded' },
    { id: 4, date: '2026-02-15', description: 'JCP VALE3', category: 'Provento', value: 890.00, type: 'credit', status: 'pending' },
    { id: 5, date: '2026-02-14', description: 'Resgate Tesouro Selic', category: 'Resgate', value: 5000.00, type: 'credit', status: 'concluded' },
]

export function HistoryPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-zinc-200/60">
                <div>
                    <h1 className="text-4xl font-bold text-zinc-950 tracking-tight">Transações</h1>
                    <p className="text-zinc-500 font-medium mt-1">Histórico completo de entradas e saídas de capital.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="h-10 px-4 bg-white border border-zinc-200 rounded-xl text-sm font-semibold hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm">
                        <Download size={16} /> Exportar
                    </button>
                    <button className="h-10 px-6 bg-zinc-950 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg">
                        Adicionar Transação
                    </button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-2xl border border-zinc-200/50 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-950 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por descrição ou ativo..."
                        className="w-full h-10 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-10 px-4 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-all">
                        <CalendarIcon size={16} />
                        Últimos 30 dias
                    </button>
                    <button className="h-10 px-4 flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-all">
                        <Filter size={16} />
                        Todos Filtros
                    </button>
                </div>
            </div>

            {/* Transactions List */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-200/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-100">
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Data</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Descrição</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Categoria</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-right">Valor</th>
                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-8 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-zinc-50/30 transition-all group">
                                    <td className="px-8 py-6 text-sm font-medium text-zinc-600">
                                        {tx.date}
                                    </td>
                                    <td className="px-8 py-6">
                                        <p className="text-sm font-bold text-zinc-950">{tx.description}</p>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="px-3 py-1 bg-zinc-100 text-[10px] font-black text-zinc-500 uppercase tracking-widest rounded-full">
                                            {tx.category}
                                        </span>
                                    </td>
                                    <td className={cn(
                                        "px-8 py-6 text-right font-black text-sm",
                                        tx.type === 'credit' ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {tx.type === 'credit' ? '+' : ''}{formatCurrency(tx.value)}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex justify-center">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                tx.status === 'concluded' ? "bg-emerald-400" : "bg-orange-400 animate-pulse"
                                            )} />
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button className="text-zinc-300 hover:text-zinc-950 transition-all">
                                            <MoreHorizontal size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
