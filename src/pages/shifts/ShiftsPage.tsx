import { useState, useEffect, useCallback } from 'react'
import { Calendar, Loader2, TrendingUp, Trash2, MapPin, Stethoscope, CheckCircle2, Clock } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useFilter } from '../../hooks/useFilter'
import { formatCurrency, cn } from '../../utils/utils'
import { startOfMonth, endOfMonth } from 'date-fns'

export function ShiftsPage() {
    const { user } = useAuth()
    const { monthDate } = useFilter()
    const [shifts, setShifts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all')

    const fetchData = useCallback(async () => {
        if (!user) {
            setShifts([])
            setLoading(false)
            return
        }

        setLoading(true)
        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        const { data, error } = await supabase
            .from('shifts')
            .select('*')
            .eq('user_id', user.id)
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())
            .order('date', { ascending: true })

        if (!error && data) setShifts(data)
        setLoading(false)
    }, [monthDate, user])

    useEffect(() => {
        fetchData()
        window.addEventListener('lifecc-data-changed', fetchData)
        return () => window.removeEventListener('lifecc-data-changed', fetchData)
    }, [fetchData])

    const filteredShifts = shifts.filter(s => filterStatus === 'all' || s.status === filterStatus)

    const totalExpected = filteredShifts.reduce((acc, s) => acc + Number(s.value_expected), 0)
    const totalReceived = filteredShifts.filter(s => s.status === 'paid').reduce((acc, s) => acc + Number(s.value_received || s.value_expected), 0)
    const pendingValue = filteredShifts.filter(s => s.status === 'pending').reduce((acc, s) => acc + Number(s.value_expected), 0)
    const averagePerShift = filteredShifts.length > 0 ? totalExpected / filteredShifts.length : 0

    async function handleMarkAsPaid(shift: any) {
        if (!user) return
        setLoading(true)
        const { error } = await supabase
            .from('shifts')
            .update({
                status: 'paid',
                value_received: shift.value_expected
            })
            .eq('id', shift.id)
            .eq('user_id', user.id)

        if (!error) fetchData()
        else setLoading(false)
    }

    async function handleDelete(id: string) {
        if (!user) return
        if (confirm('Deseja excluir este plantão?')) {
            setLoading(true)
            await supabase.from('shifts').delete().eq('id', id).eq('user_id', user.id)
            fetchData()
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Gestão de Plantões</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Monitoramento de faturamento médico e produção.</p>
                </div>
            </div>

            {/* KPI Cards Executive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="premium-card p-8 group">
                    <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Produção Estimada</p>
                    <h3 className="text-3xl font-black text-zinc-950 tracking-tighter">{formatCurrency(totalExpected)}</h3>
                    <TrendingUp size={80} className="absolute -right-4 -bottom-4 text-zinc-500/5 rotate-12 group-hover:scale-110 transition-transform duration-700" />
                </div>

                <div className="bg-emerald-50 p-8 rounded-[2.5rem] border border-emerald-100/50 shadow-sm relative overflow-hidden group">
                    <p className="text-emerald-700/50 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Liquidez Garantida</p>
                    <h3 className="text-3xl font-black text-emerald-700 tracking-tighter">{formatCurrency(totalReceived)}</h3>
                    <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 blur-3xl -translate-y-12 translate-x-12" />
                </div>

                <div className="premium-card p-8 bg-zinc-50 border-none">
                    <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Volume Pendente</p>
                    <h3 className="text-3xl font-black text-rose-600 tracking-tighter">{formatCurrency(pendingValue)}</h3>
                </div>

                <div className="premium-card-dark p-8">
                    <p className="text-zinc-500 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Ticket Médio / Dia</p>
                    <h3 className="text-3xl font-black text-zinc-950 tracking-tighter">{formatCurrency(averagePerShift)}</h3>
                </div>
            </div>

            {/* Filter Pill Navigation */}
            <div className="flex bg-zinc-100 p-1.5 rounded-[2rem] w-fit border border-zinc-200/20 shadow-inner">
                {['all', 'pending', 'paid', 'cancelled'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className={cn(
                            "px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all duration-300",
                            filterStatus === status
                                ? "bg-white text-zinc-950 shadow-xl shadow-zinc-950/5 border border-zinc-100"
                                : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50"
                        )}
                    >
                        {status === 'all' ? 'Consolidado' : status === 'paid' ? 'Pago' : status === 'pending' ? 'Pendente' : 'Cancelado'}
                    </button>
                ))}
            </div>

            {/* Shift Card List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="animate-spin text-zinc-200" size={48} />
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest text-center">Sincronizando plantões médico...</p>
                    </div>
                ) : (
                    <>
                        {filteredShifts.map(shift => (
                            <div key={shift.id} className="premium-card p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 group hover:scale-[1.01] hover:shadow-2xl hover:shadow-zinc-950/5 transition-all cursor-default">
                                <div className="flex items-center gap-8">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex flex-col items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">
                                            {new Date(shift.date).toLocaleDateString('pt-BR', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-black text-zinc-950 leading-none">
                                            {new Date(shift.date).getUTCDate()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-black text-zinc-950 tracking-tight leading-none">{shift.place}</h4>
                                            {shift.status === 'paid' ? (
                                                <CheckCircle2 size={16} className="text-emerald-500" />
                                            ) : (
                                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <Stethoscope size={14} className="text-zinc-300" />
                                                {shift.specialty || 'Geral'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                <MapPin size={14} className="text-zinc-300" />
                                                Unidade Principal
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between lg:justify-end gap-16">
                                    <div className="text-left lg:text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Faturamento Bruto</p>
                                        <p className="text-2xl font-black text-zinc-950 tracking-tighter">{formatCurrency(shift.value_expected)}</p>
                                        <div className="flex items-center lg:justify-end gap-2 mt-2">
                                            <Clock size={12} className="text-zinc-300" />
                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                                                Vence em {shift.payment_due_date ? new Date(shift.payment_due_date).toLocaleDateString('pt-BR') : '-'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {shift.status === 'pending' && (
                                            <button
                                                onClick={() => handleMarkAsPaid(shift)}
                                                className="px-6 py-3 bg-brand text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-brand/90 transition-all active:scale-95 shadow-lg shadow-brand/20"
                                            >
                                                Confirmar Recebimento
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(shift.id)}
                                            className="p-3 bg-zinc-50 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all text-zinc-300 group-hover:opacity-100 opacity-0"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {filteredShifts.length === 0 && (
                            <div className="py-32 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200">
                                <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200 mb-6">
                                    <Calendar size={40} />
                                </div>
                                <h3 className="text-zinc-950 font-black tracking-tight">Agenda Vazia</h3>
                                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-2">Nenhum plantão registrado neste recorte temporal.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
