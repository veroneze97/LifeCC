import { useState, useEffect } from 'react'
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

import { supabase } from '../services/supabase'
import { useAuth } from '../hooks/useAuth'
import { useFilter } from '../hooks/useFilter'
import { categories } from '../utils/constants'

interface TransactionFormProps {
    initialData?: any
    onSuccess: () => void
    onCancel?: () => void
}

export function TransactionForm({ initialData, onSuccess, onCancel }: TransactionFormProps) {
    const { user } = useAuth()
    const { profiles, selectedProfileId, loadingProfiles } = useFilter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([])
    const hasProfiles = profiles.length > 0
    const defaultProfileId = initialData?.profile_id || (selectedProfileId !== 'all' ? selectedProfileId : (profiles[0]?.id ?? ''))
    const [formProfileId, setFormProfileId] = useState(defaultProfileId)

    useEffect(() => {
        const nextDefaultProfileId = initialData?.profile_id || (selectedProfileId !== 'all' ? selectedProfileId : (profiles[0]?.id ?? ''))

        setFormProfileId((currentProfileId: string) => {
            if (!nextDefaultProfileId) return ''
            if (currentProfileId && profiles.some((p) => p.id === currentProfileId)) return currentProfileId
            return nextDefaultProfileId
        })
    }, [initialData?.profile_id, selectedProfileId, profiles])

    useEffect(() => {
        let isMounted = true

        async function fetchAccounts() {
            if (!user || !formProfileId) {
                if (isMounted) setAccounts([])
                return
            }
            try {
                const query = supabase
                    .from('accounts')
                    .select('id, name')
                    .eq('user_id', user.id)
                    .eq('profile_id', formProfileId)

                const { data, error: err } = await query.order('name')
                if (err) throw err
                if (isMounted && data) setAccounts(data)
            } catch (err) {
                console.error('Error fetching accounts:', err)
            }
        }
        fetchAccounts()

        return () => {
            isMounted = false
        }
    }, [formProfileId, user])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (!user) {
                throw new Error('Usuário não autenticado.')
            }
            if (!hasProfiles) {
                throw new Error('Nenhum perfil disponível no momento. Aguarde a sincronização e tente novamente.')
            }

            const formData = new FormData(e.currentTarget)
            const amount = Number(formData.get('amount'))

            if (isNaN(amount) || amount <= 0) {
                throw new Error('O valor deve ser maior que zero.')
            }

            const payload = {
                user_id: user.id,
                profile_id: formData.get('profile_id') as string,
                account_id: formData.get('account_id') as string,
                date: formData.get('date') as string,
                type: formData.get('type') as 'income' | 'expense',
                category: formData.get('category') as string,
                description: formData.get('description') as string,
                amount: amount,
                status: formData.get('status') as 'paid' | 'pending',
                source: formData.get('source') as string || null
            }

            if (!payload.profile_id || !payload.account_id || !payload.category) {
                throw new Error('Por favor, preencha todos os campos obrigatórios.')
            }

            let submissionError
            if (initialData?.id) {
                const { error: err } = await supabase
                    .from('transactions')
                    .update(payload)
                    .eq('id', initialData.id)
                    .eq('user_id', user.id)
                submissionError = err
            } else {
                const { error: err } = await supabase.from('transactions').insert(payload)
                submissionError = err
            }

            if (submissionError) throw submissionError
            window.dispatchEvent(new CustomEvent('lifecc-data-changed'))
            onSuccess()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar transação. Verifique os dados e tente novamente.')
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Tipo</label>
                    <select name="type" required defaultValue={initialData?.type || 'expense'} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all">
                        <option value="expense">Despesa</option>
                        <option value="income">Receita</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Perfil</label>
                    <select
                        name="profile_id"
                        required
                        disabled={!hasProfiles || loadingProfiles}
                        value={formProfileId}
                        onChange={(e) => setFormProfileId(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {!hasProfiles && (
                            <option value="" disabled>
                                {loadingProfiles ? 'Carregando perfis...' : 'Nenhum perfil disponível'}
                            </option>
                        )}
                        {profiles.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Data</label>
                    <input name="date" type="date" required defaultValue={initialData?.date || format(new Date(), 'yyyy-MM-dd')} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Conta</label>
                <select
                    key={`account-${formProfileId}-${initialData?.id ?? 'new'}`}
                    name="account_id"
                    required
                    defaultValue={initialData?.profile_id === formProfileId ? (initialData?.account_id || '') : ''}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all"
                >
                    <option value="">Selecione uma conta...</option>
                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Valor (R$)</label>
                    <input name="amount" type="number" step="0.01" required defaultValue={initialData?.amount} placeholder="0,00" min="0.01" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all font-bold" />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Status</label>
                    <select name="status" required defaultValue={initialData?.status || 'paid'} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all">
                        <option value="paid">Pago/Recebido</option>
                        <option value="pending">Pendente</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Categoria</label>
                <select name="category" required defaultValue={initialData?.category || ''} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all">
                    <option value="">Selecione uma categoria...</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Descrição</label>
                <input name="description" required defaultValue={initialData?.description} placeholder="O que é esse lançamento?" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all" />
            </div>

            <div className="pt-4 flex gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="p-4 bg-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-200 transition-all">
                        <ArrowLeft size={20} />
                    </button>
                )}
                <button disabled={loading || !hasProfiles || loadingProfiles} type="submit" className="flex-1 bg-brand text-white font-bold rounded-2xl py-4 hover:bg-brand/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
                    {loading ? <Loader2 className="animate-spin" size={20} /> : (initialData?.id ? 'Atualizar Lançamento' : 'Salvar Lançamento')}
                </button>
            </div>
            {!hasProfiles && (
                <p className="text-xs text-zinc-500 font-medium">Sem perfil disponível. Aguarde alguns segundos e tente novamente.</p>
            )}
        </form>
    )
}
