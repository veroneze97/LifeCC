import { useState, useEffect, useCallback } from 'react'
import { Plus, Filter, Edit2, Copy, Trash2, CheckCircle2, ArrowUpCircle, ArrowDownCircle, Loader2, Search } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFilter } from '../../hooks/useFilter'
import { formatCurrency, cn } from '../../utils/utils'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Modal } from '../../components/Modal'
import { TransactionForm } from '../../components/TransactionForm'
import { categories } from '../../utils/constants'

export function CashflowPage() {
    const { user } = useAuth()
    const { monthDate, selectedProfileId } = useFilter()
    const [transactions, setTransactions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTransaction, setEditingTransaction] = useState<any>(null)

    // Filtros
    const [filterType, setFilterType] = useState('all')
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterCategory, setFilterCategory] = useState('all')
    const [filterAccount] = useState('all')

    const fetchData = useCallback(async () => {
        if (!user) {
            setTransactions([])
            setLoading(false)
            return
        }

        setLoading(true)
        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        let query = supabase
            .from('transactions')
            .select('*, accounts(name)')
            .eq('user_id', user.id)
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())

        if (selectedProfileId !== 'all') {
            query = query.eq('profile_id', selectedProfileId)
        }

        const { data: trans } = await query.order('date', { ascending: false })

        if (trans) setTransactions(trans)
        setLoading(false)
    }, [monthDate, selectedProfileId, user])

    useEffect(() => {
        fetchData()
        window.addEventListener('lifecc-data-changed', fetchData)
        return () => window.removeEventListener('lifecc-data-changed', fetchData)
    }, [fetchData])

    const filteredTransactions = transactions.filter(t => {
        if (filterType !== 'all' && t.type !== filterType) return false
        if (filterStatus !== 'all' && t.status !== filterStatus) return false
        if (filterCategory !== 'all' && t.category !== filterCategory) return false
        if (filterAccount !== 'all' && t.account_id !== filterAccount) return false
        return true
    })

    const income = filteredTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0)
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0)
    const balance = income - expense

    async function handleDelete(id: string) {
        if (!user) return
        if (confirm('Tem certeza que deseja excluir este lançamento?')) {
            await supabase.from('transactions').delete().eq('id', id).eq('user_id', user.id)
            fetchData()
        }
    }

    async function toggleStatus(transaction: any) {
        if (!user) return
        const newStatus = transaction.status === 'paid' ? 'pending' : 'paid'
        await supabase.from('transactions').update({ status: newStatus }).eq('id', transaction.id).eq('user_id', user.id)
        fetchData()
    }

    async function duplicateTransaction(transaction: any) {
        if (!user) return
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, created_at, accounts, ...rest } = transaction
        await supabase.from('transactions').insert({ ...rest, user_id: user.id })
        fetchData()
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Fluxo de Caixa</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Gestão detalhada de ativos e passivos operacionais.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTransaction(null)
                        setIsModalOpen(true)
                    }}
                    className="h-12 px-8 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand/90 transition-all flex items-center gap-3 shadow-xl shadow-brand/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={3} /> Lançamento
                </button>
            </div>

            {/* Totalizadores Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="premium-card p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Entradas</p>
                        <h3 className="text-3xl font-black text-emerald-600 tracking-tighter">{formatCurrency(income)}</h3>
                    </div>
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                        <ArrowUpCircle size={28} />
                    </div>
                </div>
                <div className="premium-card p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Saídas</p>
                        <h3 className="text-3xl font-black text-rose-600 tracking-tighter">{formatCurrency(expense)}</h3>
                    </div>
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                        <ArrowDownCircle size={28} />
                    </div>
                </div>
                <div className="premium-card-dark p-8 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-2">Saldo Líquido</p>
                        <h3 className="text-3xl font-black text-zinc-950 tracking-tighter">{formatCurrency(balance)}</h3>
                    </div>
                    <div className="p-4 bg-zinc-100 text-zinc-700 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={28} />
                    </div>
                </div>
            </div>

            {/* Inteligência de Filtros */}
            <div className="flex flex-wrap gap-4 items-center bg-zinc-100/50 p-2 rounded-[2rem]">
                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <Filter size={16} className="text-zinc-400" />
                    <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-950 focus:ring-0 cursor-pointer"
                    >
                        <option value="all">Tipo / Todos</option>
                        <option value="income">Entradas</option>
                        <option value="expense">Saídas</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-950 focus:ring-0 cursor-pointer"
                    >
                        <option value="all">Status / Todos</option>
                        <option value="paid">Confirmado</option>
                        <option value="pending">Aguardando</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-zinc-950 focus:ring-0 cursor-pointer"
                    >
                        <option value="all">Categoria / Todas</option>
                        {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>

                <div className="flex-1 md:max-w-xs relative group">
                    <input
                        type="text"
                        placeholder="Pesquisar transação..."
                        className="w-full bg-white border border-zinc-100 rounded-2xl px-12 py-3 text-xs font-medium focus:ring-4 focus:ring-zinc-950/5 transition-all outline-none"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-zinc-950 transition-colors" size={16} />
                </div>
            </div>

            {/* Lista Executiva (Substituindo Tabela) */}
            <div className="space-y-4">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-zinc-200" size={48} />
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Sincronizando registros...</p>
                    </div>
                ) : (
                    <>
                        {filteredTransactions.map(t => (
                            <div key={t.id} className="premium-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:translate-x-1 transition-all border-none bg-white">
                                <div className="flex items-center gap-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors",
                                        t.type === 'income' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-rose-50 border-rose-100 text-rose-600"
                                    )}>
                                        {t.type === 'income' ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="text-sm font-black text-zinc-950 tracking-tight">{t.description}</h4>
                                            <span className="text-[8px] px-2 py-0.5 bg-zinc-50 border border-zinc-100 text-zinc-400 rounded-full font-black uppercase tracking-wider">{t.category}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                            <span>{new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>{t.accounts?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-12">
                                    <div className="text-right">
                                        <p className={cn("text-xl font-black tracking-tighter", t.type === 'income' ? "text-emerald-600" : "text-zinc-950")}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </p>
                                        <button
                                            onClick={() => toggleStatus(t)}
                                            className={cn(
                                                "text-[8px] font-black uppercase tracking-[0.2em] mt-1 transition-colors",
                                                t.status === 'paid' ? "text-emerald-500" : "text-amber-500"
                                            )}
                                        >
                                            {t.status === 'paid' ? 'Confirmado' : 'Aguardando'}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                        <button onClick={() => duplicateTransaction(t)} className="p-3 bg-zinc-50 hover:bg-zinc-200 hover:text-white rounded-xl transition-all text-zinc-400">
                                            <Copy size={16} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingTransaction(t)
                                                setIsModalOpen(true)
                                            }}
                                            className="p-3 bg-zinc-50 hover:bg-zinc-200 hover:text-white rounded-xl transition-all text-zinc-400"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(t.id)} className="p-3 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-rose-400">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredTransactions.length === 0 && (
                            <div className="py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200 mb-6">
                                    <ArrowRightLeft size={40} />
                                </div>
                                <h3 className="text-zinc-950 font-black tracking-tight">Sem atividades</h3>
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">Nenhum lançamento encontrado para este período.</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
            >
                <TransactionForm
                    initialData={editingTransaction}
                    onSuccess={() => {
                        setIsModalOpen(false)
                        fetchData()
                    }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    )
}

import { ArrowRightLeft } from 'lucide-react'
