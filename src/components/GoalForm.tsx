import { useState } from 'react'
import { Target, Calendar, DollarSign, Loader2, User, AlertCircle } from 'lucide-react'

import { supabase } from '../services/supabase'
import { useFilter } from '../hooks/useFilter'
import { cn } from '../utils/utils'

interface GoalFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel: () => void
}

export function GoalForm({ initialData, onSuccess, onCancel }: GoalFormProps) {
    const { profiles, selectedProfileId } = useFilter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        profile_id: initialData?.profile_id || (selectedProfileId !== 'all' ? selectedProfileId : profiles[0]?.id),
        name: initialData?.name || '',
        target_value: initialData?.target_value || '',
        target_date: initialData?.target_date || '',
        monthly_contribution: initialData?.monthly_contribution || '',
        expected_return_rate: initialData?.expected_return_rate || 0,
        scope: initialData?.scope || 'individual'
    })

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const targetVal = Number(formData.target_value)
            if (isNaN(targetVal) || targetVal <= 0) {
                throw new Error('O valor alvo deve ser maior que zero.')
            }

            const data = {
                ...formData,
                                profile_id: formData.scope === 'joint' ? null : formData.profile_id,
                target_value: targetVal,
                monthly_contribution: Number(formData.monthly_contribution || 0),
                target_date: formData.target_date || null
            }

            if (!data.name) {
                throw new Error('O nome da meta é obrigatório.')
            }

            let submissionError
            if (initialData?.id) {
                const { error: err } = await supabase.from('goals').update(data).eq('id', initialData.id)
                submissionError = err
            } else {
                const { error: err } = await supabase.from('goals').insert([data])
                submissionError = err
            }

            if (submissionError) throw submissionError
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar meta. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Nome da Meta</label>
                    <div className="relative">
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                        <input
                            required
                            type="text"
                            placeholder="Ex: Independência Financeira"
                            className="premium-input pl-12"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Valor Alvo</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                className="premium-input pl-12"
                                min="0.01"
                                value={formData.target_value}
                                onChange={e => setFormData({ ...formData, target_value: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Data Limite (Opcional)</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <input
                                type="date"
                                className="premium-input pl-12"
                                value={formData.target_date}
                                onChange={e => setFormData({ ...formData, target_date: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Escopo da Meta</label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, scope: 'individual' })}
                            className={cn(
                                "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                formData.scope === 'individual'
                                    ? "bg-zinc-950 text-white border-zinc-950 shadow-lg shadow-zinc-950/20"
                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                            )}
                        >
                            Individual
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, scope: 'joint' })}
                            className={cn(
                                "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                formData.scope === 'joint'
                                    ? "bg-zinc-950 text-white border-zinc-950 shadow-lg shadow-zinc-950/20"
                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                            )}
                        >
                            Conjunta (Casal)
                        </button>
                    </div>
                </div>

                {formData.scope === 'individual' && (
                    <div>
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 block">Dono da Meta (Perfil)</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                            <select
                                required
                                className="premium-input pl-12 appearance-none"
                                value={formData.profile_id}
                                onChange={e => setFormData({ ...formData, profile_id: e.target.value })}
                            >
                                {profiles.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 h-14 bg-white text-zinc-950 border border-zinc-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/20 active:scale-95 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : initialData ? 'Salvar Alterações' : 'Criar Meta'}
                </button>
            </div>
        </form>
    )
}
