import { useState } from 'react'
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react'

import { supabase } from '../services/supabase'
import { useFilter } from '../hooks/useFilter'

interface ShiftFormProps {
    onSuccess: () => void
    onCancel: () => void
}

export function ShiftForm({ onSuccess, onCancel }: ShiftFormProps) {
    const { profiles, selectedProfileId } = useFilter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const valueExpected = Number(formData.get('value_expected'))
            const valueReceived = formData.get('value_received') ? Number(formData.get('value_received')) : null

            if (isNaN(valueExpected) || valueExpected <= 0) {
                throw new Error('O valor esperado deve ser maior que zero.')
            }

            const payload = {
                user_id: 'local',
                profile_id: formData.get('profile_id') as string,
                date: formData.get('date') as string,
                place: formData.get('place') as string,
                specialty: formData.get('specialty') as string || null,
                value_expected: valueExpected,
                value_received: valueReceived,
                status: formData.get('status') as any,
                notes: formData.get('notes') as string || null
            }

            if (!payload.profile_id || !payload.date || !payload.place) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.')
            }

            const { error: submissionError } = await supabase.from('shifts').insert(payload)
            if (submissionError) throw submissionError
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar plantão. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Data</label>
                    <input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Perfil</label>
                    <select
                        name="profile_id"
                        required
                        defaultValue={selectedProfileId !== 'all' ? selectedProfileId : profiles[0]?.id}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all"
                    >
                        {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Status</label>
                    <select name="status" required className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all">
                        <option value="scheduled">Agendado</option>
                        <option value="done">Realizado</option>
                        <option value="invoiced">Faturado</option>
                        <option value="paid">Pago</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Local</label>
                <input name="place" required placeholder="Ex: Hospital Albert Einstein" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Especialidade (Opcional)</label>
                <input name="specialty" placeholder="Ex: Plantão de Emergência" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Valor Esperado</label>
                    <input name="value_expected" type="number" step="0.01" min="0.01" required placeholder="0,00" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Valor Recebido</label>
                    <input name="value_received" type="number" step="0.01" placeholder="0,00" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold" />
                </div>
            </div>

            <div className="pt-4 flex gap-3">
                <button type="button" onClick={onCancel} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-all">
                    <ArrowLeft size={20} />
                </button>
                <button disabled={loading} type="submit" className="flex-1 bg-zinc-950 text-white font-bold rounded-2xl py-4 hover:bg-zinc-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-zinc-950/20">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Salvar Plantão'}
                </button>
            </div>
        </form>
    )
}
