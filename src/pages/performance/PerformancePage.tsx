import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, TrendingUp, TrendingDown, Dumbbell, Scale, Calendar, Trash2, Edit2, Activity, Zap, CheckCircle2 } from 'lucide-react'
import { supabase } from '../../services/supabase'
import { useFilter } from '../../hooks/useFilter'
import { cn } from '../../utils/utils'
import { startOfMonth, endOfMonth, getDaysInMonth, isSameDay } from 'date-fns'
import { Modal } from '../../components/Modal'
import { HealthMetricsForm } from '../../components/HealthMetricsForm'

export function PerformancePage() {
    const { monthDate, selectedProfileId } = useFilter()
    const [metrics, setMetrics] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<any>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        const start = startOfMonth(monthDate)
        const end = endOfMonth(monthDate)

        let query = supabase
            .from('health_metrics')
            .select('*')
            .eq('user_id', 'local')
            .gte('date', start.toISOString())
            .lte('date', end.toISOString())

        if (selectedProfileId !== 'all') {
            query = query.eq('profile_id', selectedProfileId)
        }

        const { data, error } = await query.order('date', { ascending: true })

        if (!error && data) setMetrics(data)
        setLoading(false)
    }, [monthDate, selectedProfileId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const daysInMonth = getDaysInMonth(monthDate)
    const totalWorkouts = metrics.reduce((sum, m) => sum + (m.workouts || 0), 0)
    const consistency = Math.round((totalWorkouts / daysInMonth) * 100)

    const weightEntries = metrics.filter(m => m.weight).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const initialWeight = weightEntries.length > 0 ? weightEntries[0].weight : 0
    const currentWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : 0
    const weightDelta = currentWeight - initialWeight

    async function handleDelete(id: string) {
        if (confirm('Deseja excluir este registro de saúde?')) {
            await supabase.from('health_metrics').delete().eq('id', id)
            fetchData()
        }
    }

    const maxWeight = Math.max(...weightEntries.map(w => w.weight), 1)
    const minWeight = Math.min(...weightEntries.map(w => w.weight), 0)
    const weightRange = maxWeight - minWeight || 10

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Performance Física</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Sua consistência biológica e evolução corporal.</p>
                </div>
                <button
                    onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                    className="h-12 px-8 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center gap-3 shadow-xl shadow-zinc-950/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={18} strokeWidth={3} /> Novo Registro
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="animate-spin text-zinc-200" size={48} />
                    <p className="text-zinc-300 font-black uppercase tracking-widest text-[10px]">Sincronizando Métricas...</p>
                </div>
            ) : (
                <>
                    {/* KPI Cards Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="premium-card p-10 group relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Sessões Realizadas</p>
                                <h3 className="text-5xl font-black text-zinc-950 tracking-tighter mb-2">{totalWorkouts}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Treinos no Mês</span>
                                </div>
                            </div>
                            <Dumbbell size={100} className="absolute -right-6 -bottom-6 text-zinc-50 -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                        </div>

                        <div className="premium-card p-10">
                            <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Consistência Mensal</p>
                            <div className="flex items-baseline gap-2 mb-4">
                                <h3 className="text-5xl font-black text-zinc-950 tracking-tighter">{consistency}%</h3>
                                <Activity size={16} className="text-zinc-950" />
                            </div>
                            <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-zinc-950 h-full transition-all duration-1000 shadow-sm shadow-zinc-400" style={{ width: `${consistency}%` }} />
                            </div>
                        </div>

                        <div className="premium-card-dark p-10 group relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Status Corporal</p>
                                <div className="flex items-baseline gap-3 mb-2">
                                    <h3 className="text-5xl font-black tracking-tighter">{currentWeight.toFixed(1)}kg</h3>
                                    <span className={cn(
                                        "text-[10px] font-black flex items-center gap-1 px-3 py-1 rounded-full",
                                        weightDelta <= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                    )}>
                                        {weightDelta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                        {Math.abs(weightDelta).toFixed(1)}kg
                                    </span>
                                </div>
                                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">vs início do mês</p>
                            </div>
                            <Scale size={100} className="absolute -right-6 -bottom-6 text-white/[0.03] -rotate-12 pointer-events-none group-hover:scale-110 transition-transform duration-700" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Weight Evolution Chart */}
                        <div className="lg:col-span-2 premium-card p-10">
                            <div className="flex items-center justify-between mb-12">
                                <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em]">Evolução de Peso (Mensal)</p>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-zinc-950 shadow-[0_0_8px_rgba(0,0,0,0.2)]" />
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Média: {(metrics.reduce((s, m) => s + (m.weight || 0), 0) / (metrics.filter(m => m.weight).length || 1)).toFixed(1)}kg</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-64 flex items-end justify-between gap-1.5 px-2">
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1
                                    const entry = metrics.find(m => new Date(m.date).getUTCDate() === day)
                                    const height = entry?.weight
                                        ? ((entry.weight - (minWeight - 2)) / (weightRange + 4)) * 100
                                        : 0

                                    return (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group h-full justify-end">
                                            <div
                                                className={cn(
                                                    "w-full rounded-full transition-all duration-700",
                                                    entry?.weight ? "bg-zinc-950 shadow-lg" : "bg-zinc-100/50",
                                                    isSameDay(new Date(monthDate.getUTCFullYear(), monthDate.getUTCMonth(), day), new Date()) && "ring-2 ring-zinc-950 ring-offset-4 ring-offset-zinc-50"
                                                )}
                                                style={{ height: entry?.weight ? `${Math.max(height, 8)}%` : '6px' }}
                                            >
                                                {entry?.weight && (
                                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-zinc-950 text-white text-[9px] font-black px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100 whitespace-nowrap z-20">
                                                        {entry.weight}kg
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-between mt-8 px-2 border-t border-zinc-50 pt-6">
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Day 01</span>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Day {Math.floor(daysInMonth / 2)}</span>
                                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Day {daysInMonth}</span>
                            </div>
                        </div>

                        {/* Recent History List */}
                        <div className="lg:col-span-1 space-y-6">
                            <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">Timeline de Saúde</p>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {metrics.slice().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                                    <div key={item.id} className="premium-card p-6 flex items-center justify-between group hover:translate-x-1 transition-all border-none shadow-none bg-white">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all",
                                                item.workouts > 0 ? "bg-emerald-50 border-emerald-100 text-emerald-600 shadow-sm" : "bg-zinc-50 border-zinc-100 text-zinc-300"
                                            )}>
                                                {item.workouts > 0 ? <Dumbbell size={20} /> : <Calendar size={20} />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-black text-zinc-950 tracking-tight leading-none">
                                                        {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' })}
                                                    </h4>
                                                    {item.workouts > 0 && <CheckCircle2 size={12} className="text-emerald-500" />}
                                                </div>
                                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                                    {item.weight ? `${item.weight}kg` : 'No weight'} • {item.workouts > 0 ? 'Treino Alpha' : 'Descanso'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <button
                                                onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                                                className="p-2.5 bg-zinc-50 hover:bg-zinc-950 hover:text-white rounded-xl transition-all text-zinc-400"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-all text-rose-400"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {metrics.length === 0 && (
                                    <div className="py-20 text-center space-y-4">
                                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto text-zinc-200">
                                            <Zap size={32} />
                                        </div>
                                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Nenhum dado capturado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Editar Registro de Saúde' : 'Novo Registro Diário'}
            >
                <HealthMetricsForm
                    initialData={editingItem}
                    onSuccess={() => { setIsModalOpen(false); fetchData(); }}
                    onCancel={() => setIsModalOpen(false)}
                />
            </Modal>
        </div>
    )
}
