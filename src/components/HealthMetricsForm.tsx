import { useState } from 'react'
import { Loader2, ArrowLeft, Dumbbell, Scale, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

import { supabase } from '../services/supabase'
import { useFilter } from '../hooks/useFilter'

interface HealthMetricsFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel?: () => void
}

export function HealthMetricsForm({ initialData, onSuccess, onCancel }: HealthMetricsFormProps) {
    const { profiles, selectedProfileId } = useFilter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const weightVal = formData.get('weight') ? Number(formData.get('weight')) : null

            if (weightVal !== null && (isNaN(weightVal) || weightVal <= 0)) {
                throw new Error('O peso deve ser um valor positivo.')
            }

            const payload = {
                                profile_id: formData.get('profile_id') as string,
                date: formData.get('date') as string,
                weight: weightVal,
                workouts: formData.get('workouts') === 'on' ? 1 : 0,
                notes: formData.get('notes') as string || null,
            }

            if (!payload.profile_id || !payload.date) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.')
            }

            let submissionError
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from('health_metrics')
                    .update(payload)
                    .eq('id', initialData.id)
                    
                submissionError = err
            } else {
                const { data: existing } = await supabase
                    .from('health_metrics')
                    .select('id')
                    
                    .eq('profile_id', payload.profile_id)
                    .eq('date', payload.date)
                    .maybeSingle()

                if (existing) {
                    const { error: err } = await supabase
                        .from('health_metrics')
                        .update(payload)
                        .eq('id', existing.id)
                        
                    submissionError = err
                } else {
                    const { error: err } = await supabase
                        .from('health_metrics')
                        .insert(payload)
                    submissionError = err
                }
            }

            if (submissionError) throw submissionError
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar registro de saúde. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-zinc-950">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Data do Registro</label>
                        <input
                            required
                            name="date"
                            type="date"
                            defaultValue={initialData?.date || format(new Date(), 'yyyy-MM-dd')}
                            className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Membro (Perfil)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <select
                                required
                                name="profile_id"
                                defaultValue={initialData?.profile_id || (selectedProfileId !== 'all' ? selectedProfileId : profiles[0]?.id)}
                                className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all appearance-none"
                            >
                                {profiles.map((p: any) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Peso Atual (kg)</label>
                        <div className="relative">
                            <input
                                name="weight"
                                type="number"
                                step="0.1"
                                min="0.1"
                                defaultValue={initialData?.weight}
                                placeholder="00.0"
                                className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all font-bold"
                            />
                            <Scale className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Atividade Física</label>
                        <label className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-100 rounded-2xl cursor-pointer hover:bg-zinc-100 transition-all select-none">
                            <input
                                name="workouts"
                                type="checkbox"
                                defaultChecked={initialData?.workouts > 0}
                                className="w-5 h-5 rounded-lg border-zinc-300 focus:ring-zinc-950 text-zinc-950"
                            />
                            <div className="flex items-center gap-2">
                                <Dumbbell size={18} className="text-zinc-500" />
                                <span className="text-sm font-bold text-zinc-700">Fiz Treino Hoje</span>
                            </div>
                        </label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Notas / Sentimento</label>
                    <textarea
                        name="notes"
                        rows={3}
                        defaultValue={initialData?.notes}
                        placeholder="Como foi o treino? Como se sentiu?"
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all resize-none"
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 bg-zinc-950 text-white font-bold rounded-2xl py-4 hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (initialData?.id ? 'Atualizar Registro' : 'Salvar Registro')}
                </button>
            </div>
        </form>
    )
}
