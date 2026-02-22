import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, Wallet, Layers, Trash2, Edit2, Shield, CircleDollarSign, PieChart } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useFilter } from '../../hooks/useFilter'
import { formatCurrency, cn } from '../../utils/utils'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Modal } from '../../components/Modal'
import { AssetLiabilityForm } from '../../components/AssetLiabilityForm'
import { GoalForm } from '../../components/GoalForm'
import { Target } from 'lucide-react'

export function NetWorthPage() {
    const { monthDate, selectedProfileId } = useFilter()
    const [assets, setAssets] = useState<any[]>([])
    const [liabilities, setLiabilities] = useState<any[]>([])
    const [goals, setGoals] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'asset' | 'liability' | 'goal'>('asset')
    const [editingItem, setEditingItem] = useState<any>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        const applyFilter = (query: any) => {
            if (selectedProfileId !== 'all') {
                return query.eq('profile_id', selectedProfileId)
            }
            return query
        }

        const [assetsRes, liabilitiesRes, goalsRes] = await Promise.all([
            applyFilter(supabase.from('assets').select('*')).gte('date_reference', start.toISOString()).lte('date_reference', end.toISOString()),
            applyFilter(supabase.from('liabilities').select('*')).gte('date_reference', start.toISOString()).lte('date_reference', end.toISOString()),
            applyFilter(supabase.from('goals').select('*')).order('created_at', { ascending: true })
        ])

        if (assetsRes.data) setAssets(assetsRes.data)
        if (liabilitiesRes.data) setLiabilities(liabilitiesRes.data)
        if (goalsRes.data) setGoals(goalsRes.data)
        setLoading(false)
    }, [monthDate, selectedProfileId])

    const fetchHistory = useCallback(async () => {
        const last6Months = Array.from({ length: 6 }).map((_, i) => {
            const d = subMonths(monthDate, i)
            return {
                start: startOfMonth(d),
                end: endOfMonth(d),
                label: format(d, 'MMM', { locale: ptBR })
            }
        }).reverse()

        const applyFilter = (query: any) => {
            if (selectedProfileId !== 'all') {
                return query.eq('profile_id', selectedProfileId)
            }
            return query
        }

        const historyPromises = last6Months.map(async (period) => {
            const [a, l] = await Promise.all([
                applyFilter(supabase.from('assets').select('value')).gte('date_reference', period.start.toISOString()).lte('date_reference', period.end.toISOString()),
                applyFilter(supabase.from('liabilities').select('value')).gte('date_reference', period.start.toISOString()).lte('date_reference', period.end.toISOString())
            ])

            const totalA = (a.data || []).reduce((sum: number, item: any) => sum + Number(item.value), 0)
            const totalL = (l.data || []).reduce((sum: number, item: any) => sum + Number(item.value), 0)

            return {
                label: period.label,
                value: totalA - totalL
            }
        })

        const results = await Promise.all(historyPromises)
        setHistory(results)
    }, [monthDate, selectedProfileId])

    useEffect(() => {
        fetchData()
        fetchHistory()
        window.addEventListener('lifecc-data-changed', fetchData)
        window.addEventListener('lifecc-data-changed', fetchHistory)
        return () => {
            window.removeEventListener('lifecc-data-changed', fetchData)
            window.removeEventListener('lifecc-data-changed', fetchHistory)
        }
    }, [fetchData, fetchHistory])

    const totalAssets = assets.reduce((sum, item) => sum + Number(item.value), 0)
    const totalLiabilities = liabilities.reduce((sum, item) => sum + Number(item.value), 0)
    const netWorth = totalAssets - totalLiabilities

    async function handleDelete(id: string, type: 'asset' | 'liability' | 'goal') {
        if (confirm(`Deseja excluir este ${type === 'goal' ? 'objetivo' : 'item do patrimônio'}?`)) {
            const tableMap: any = { asset: 'assets', liability: 'liabilities', goal: 'goals' }
            await supabase.from(tableMap[type]).delete().eq('id', id)
            fetchData()
            fetchHistory()
        }
    }

    const getTypeLabel = (type: string) => {
        const labels: any = {
            cash: 'Liquidez',
            investment: 'Investimento',
            property: 'Imóvel',
            vehicle: 'Veículo',
            other: 'Outro',
            loan: 'Empréstimo',
            credit_card: 'Cartão',
            financing: 'Financiamento'
        }
        return labels[type] || type
    }

    const maxHistoryValue = Math.max(...history.map(h => Math.abs(h.value)), 1000)

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Patrimônio Líquido</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Balanço consolidado de ativos e passivos globais.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { setModalType('goal'); setEditingItem(null); setIsModalOpen(true); }}
                        className="px-6 py-3 bg-white text-zinc-950 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        <Target size={16} /> Nova Meta
                    </button>
                    <button
                        onClick={() => { setModalType('liability'); setEditingItem(null); setIsModalOpen(true); }}
                        className="px-6 py-3 bg-white text-zinc-950 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} /> Passivo
                    </button>
                    <button
                        onClick={() => { setModalType('asset'); setEditingItem(null); setIsModalOpen(true); }}
                        className="px-6 py-3 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all active:scale-95 flex items-center gap-2 shadow-xl shadow-brand/20"
                    >
                        <Plus size={16} /> Ativo
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-zinc-200" size={48} />
                    <p className="text-zinc-300 font-black uppercase tracking-widest text-[10px]">Analisando Balanço...</p>
                </div>
            ) : (
                <>
                    {/* Main Net Worth Card & History Chart */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-1 premium-card p-10 flex flex-col justify-between relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                    Equidade Consolidada <Shield size={12} className="text-emerald-500" />
                                </p>
                                <h2 className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">
                                    {formatCurrency(netWorth)}
                                </h2>
                                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Patrimônio Realizado</p>
                            </div>

                            <div className="mt-16 space-y-4 relative z-10">
                                <div className="flex items-center justify-between p-5 bg-emerald-50 rounded-[1.5rem] border border-emerald-100/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Total Ativos</span>
                                    <span className="text-lg font-black text-emerald-700 tracking-tight">{formatCurrency(totalAssets)}</span>
                                </div>
                                <div className="flex items-center justify-between p-5 bg-rose-50 rounded-[1.5rem] border border-rose-100/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-600">Total Passivos</span>
                                    <span className="text-lg font-black text-rose-700 tracking-tight">{formatCurrency(totalLiabilities)}</span>
                                </div>
                            </div>
                            <Layers size={150} className="absolute -right-8 -top-8 text-zinc-50 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="lg:col-span-2 premium-card p-10">
                            <div className="flex items-center justify-between mb-12">
                                <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em]">Evolução Patrimonial (6 Meses)</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Progresso Alpha</span>
                                </div>
                            </div>
                            <div className="h-64 flex items-end justify-between gap-4 px-4">
                                {history.map((h, i) => {
                                    const height = Math.max((Math.abs(h.value) / maxHistoryValue) * 100, 5)
                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group relative">
                                            <div
                                                className={cn(
                                                    "w-full rounded-t-2xl transition-all duration-700 shadow-lg",
                                                    h.value >= 0 ? "bg-brand group-hover:bg-brand/90" : "bg-rose-500 group-hover:bg-rose-600"
                                                )}
                                                style={{ height: `${height}%` }}
                                            >
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-brand text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 whitespace-nowrap z-20">
                                                    {formatCurrency(h.value)}
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{h.label}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Inventory List (Substituindo Tabela) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Assets Column */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-zinc-950 tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
                                <CircleDollarSign size={18} className="text-emerald-500" /> Portfólio de Ativos
                            </h3>
                            <div className="space-y-4">
                                {assets.map(item => (
                                    <div key={item.id} className="premium-card p-6 flex items-center justify-between group hover:translate-x-1 transition-all border-none shadow-none bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-white group-hover:shadow-sm">
                                                <Wallet size={20} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-zinc-950 tracking-tight leading-none mb-1">{item.name}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{getTypeLabel(item.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-emerald-600 tracking-tighter">{formatCurrency(item.value)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button
                                                    onClick={() => { setModalType('asset'); setEditingItem(item); setIsModalOpen(true); }}
                                                    className="p-2.5 bg-zinc-50 hover:bg-zinc-200 hover:text-white rounded-xl transition-all text-zinc-400"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, 'asset')}
                                                    className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-rose-400"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {assets.length === 0 && (
                                    <div className="py-16 text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                                        <p className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Nenhum ativo catalogado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Liabilities Column */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-zinc-950 tracking-[0.2em] uppercase flex items-center gap-3 mb-8">
                                <PieChart size={18} className="text-rose-500" /> Exposição em Passivos
                            </h3>
                            <div className="space-y-4">
                                {liabilities.map(item => (
                                    <div key={item.id} className="premium-card p-6 flex items-center justify-between group hover:translate-x-1 transition-all border-none shadow-none bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-white group-hover:shadow-sm">
                                                <Layers size={20} className="text-zinc-400 group-hover:text-zinc-950 transition-colors" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-zinc-950 tracking-tight leading-none mb-1">{item.name}</h4>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{getTypeLabel(item.type)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <p className="text-lg font-black text-rose-600 tracking-tighter">{formatCurrency(item.value)}</p>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                                <button
                                                    onClick={() => { setModalType('liability'); setEditingItem(item); setIsModalOpen(true); }}
                                                    className="p-2.5 bg-zinc-50 hover:bg-zinc-200 hover:text-white rounded-xl transition-all text-zinc-400"
                                                >
                                                    <Edit2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, 'liability')}
                                                    className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-rose-400"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {liabilities.length === 0 && (
                                    <div className="py-16 text-center bg-zinc-50/50 rounded-[2rem] border border-dashed border-zinc-200">
                                        <p className="text-zinc-300 text-[10px] font-black uppercase tracking-widest">Nenhum passivo catalogado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Goals Section */}
                    {goals.length > 0 && (
                        <div className="space-y-8 mt-12">
                            <h3 className="text-xs font-black text-zinc-950 tracking-[0.2em] uppercase flex items-center gap-3">
                                <Target size={18} className="text-zinc-950" /> Metas Estratégicas
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {goals.map(goal => {
                                    const progress = Math.min((netWorth / goal.target_value) * 100, 100)
                                    return (
                                        <div key={goal.id} className="premium-card p-8 group relative overflow-hidden">
                                            <div className="flex justify-between items-start mb-6 pt-2">
                                                <div>
                                                    <h4 className="text-sm font-black text-zinc-950 tracking-tight leading-none mb-1">{goal.name}</h4>
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alvo: {formatCurrency(goal.target_value)}</p>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => { setModalType('goal'); setEditingItem(goal); setIsModalOpen(true); }} className="p-2 text-zinc-400 hover:text-zinc-950"><Edit2 size={14} /></button>
                                                    <button onClick={() => handleDelete(goal.id, 'goal')} className="p-2 text-rose-400 hover:text-rose-600"><Trash2 size={14} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-2xl font-black text-zinc-950 tracking-tighter">{Math.floor(progress)}%</span>
                                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Concluído</span>
                                                </div>
                                                <div className="w-full bg-zinc-50 h-1.5 rounded-full overflow-hidden border border-zinc-100">
                                                    <div
                                                        className="bg-brand h-full transition-all duration-1000"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? `Editar ${modalType === 'asset' ? 'Ativo' : modalType === 'liability' ? 'Passivo' : 'Meta'}` : `Novo ${modalType === 'asset' ? 'Ativo' : modalType === 'liability' ? 'Passivo' : 'Meta'}`}
            >
                {modalType === 'goal' ? (
                    <GoalForm
                        initialData={editingItem}
                        onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                        onCancel={() => setIsModalOpen(false)}
                    />
                ) : (
                    <AssetLiabilityForm
                        type={modalType as 'asset' | 'liability'}
                        initialData={editingItem}
                        onSuccess={() => { setIsModalOpen(false); fetchData(); fetchHistory(); }}
                        onCancel={() => setIsModalOpen(false)}
                    />
                )}
            </Modal>
        </div>
    )
}
