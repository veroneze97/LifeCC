import { useState } from 'react'
import { Loader2, ArrowLeft, User, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

import { supabase } from '../services/supabase'
import { useFilter } from '../hooks/useFilter'
import { cn } from '../utils/utils'

interface AssetLiabilityFormProps {
    type: 'asset' | 'liability'
    initialData?: any
    onSuccess: () => void
    onCancel?: () => void
}

const assetTypes = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'investment', label: 'Investimento' },
    { value: 'property', label: 'Imóvel' },
    { value: 'vehicle', label: 'Veículo' },
    { value: 'other', label: 'Outros' }
]

const liabilityTypes = [
    { value: 'loan', label: 'Empréstimo' },
    { value: 'credit_card', label: 'Cartão de Crédito' },
    { value: 'financing', label: 'Financiamento' },
    { value: 'other', label: 'Outros' }
]

export function AssetLiabilityForm({ type, initialData, onSuccess, onCancel }: AssetLiabilityFormProps) {
    const { profiles, selectedProfileId } = useFilter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentType, setCurrentType] = useState<'asset' | 'liability'>(type)
    const options = currentType === 'asset' ? assetTypes : liabilityTypes
    const tableName = currentType === 'asset' ? 'assets' : 'liabilities'

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const formData = new FormData(e.currentTarget)
            const value = Number(formData.get('value'))

            if (isNaN(value) || value < 0) {
                throw new Error('O valor deve ser positivo.')
            }

            const payload = {
                                profile_id: formData.get('profile_id') as string,
                name: formData.get('name') as string,
                value: value,
                type: formData.get('type') as any,
                date_reference: formData.get('date_reference') as string,
            }

            if (!payload.profile_id || !payload.name) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.')
            }

            let submissionError
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from(tableName as any)
                    .update(payload)
                    .eq('id', initialData.id)
                    
                submissionError = err
            } else {
                const { error: err } = await supabase
                    .from(tableName as any)
                    .insert(payload)
                submissionError = err
            }

            if (submissionError) throw submissionError
            window.dispatchEvent(new CustomEvent('lifecc-data-changed'))
            onSuccess()
        } catch (err: any) {
            setError(err.message || `Erro ao salvar ${currentType === 'asset' ? 'ativo' : 'passivo'}. Tente novamente.`)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 text-zinc-950">
            {!initialData && (
                <div className="flex bg-zinc-100 p-1 rounded-2xl">
                    <button
                        type="button"
                        onClick={() => setCurrentType('asset')}
                        className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            currentType === 'asset' ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        Ativo
                    </button>
                    <button
                        type="button"
                        onClick={() => setCurrentType('liability')}
                        className={cn(
                            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                            currentType === 'liability' ? "bg-white text-zinc-950 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                    >
                        Passivo
                    </button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={18} className="shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Nome / Descrição</label>
                    <input
                        required
                        name="name"
                        defaultValue={initialData?.name}
                        placeholder="Ex: Reserva de Emergência"
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Valor (R$)</label>
                    <input
                        required
                        name="value"
                        type="number"
                        step="0.01"
                        min="0"
                        defaultValue={initialData?.value}
                        placeholder="0,00"
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all font-bold"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tipo de {currentType === 'asset' ? 'Ativo' : 'Passivo'}</label>
                    <select
                        required
                        name="type"
                        defaultValue={initialData?.type || options[0].value}
                        className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all appearance-none"
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Data de Referência</label>
                    <input
                        required
                        name="date_reference"
                        type="date"
                        defaultValue={initialData?.date_reference || format(new Date(), 'yyyy-MM-dd')}
                        className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-zinc-950/5 transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Perfil / Membro</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
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

            <div className="pt-4 flex gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <button
                    disabled={loading}
                    type="submit"
                    className="flex-1 bg-brand text-white font-bold rounded-2xl py-4 hover:bg-brand/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-brand/20"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (initialData?.id ? 'Atualizar' : 'Adicionar')}
                </button>
            </div>
        </form>
    )
}
