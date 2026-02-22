import { useState } from 'react'
import { Database, RefreshCcw, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react'

import { seedDatabase, clearLocalData } from '../../services/seed'
import { useFilter } from '../../hooks/useFilter'
import { supabase } from '../../services/supabase'
import { cn } from '../../utils/utils'

export function SettingsPage() {
    const { profiles, refreshProfiles } = useFilter()
    const [loading, setLoading] = useState(false)
    const [savingProfile, setSavingProfile] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [name, setName] = useState(profiles[0]?.name || '')

    async function handleSaveProfile() {
        if (!profiles[0]) return
        setSavingProfile(true)
        setError(null)
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ name })
                .eq('id', profiles[0].id)
            if (updateError) throw updateError
            await refreshProfiles()
        } catch (err: any) {
            setError(err.message || 'Falha ao salvar perfil.')
        } finally {
            setSavingProfile(false)
        }
    }

    async function handleSeed() {
        if (!confirm('Esta ação irá apagar seus dados e carregar dados de exemplo. Deseja continuar?')) return

        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            await clearLocalData()
            await seedDatabase()
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message || 'Falha ao carregar dados de exemplo.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div>
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Configurações</h1>
                <p className="text-zinc-500 text-sm font-medium mt-1">Perfil autenticado e base de dados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="premium-card p-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-brand text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/20">
                            <Save size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-zinc-950 tracking-tight">Perfil</h2>
                            <p className="text-xs text-zinc-500 font-medium">O app usa seu `auth.uid()` como `profile_id`.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Nome do perfil</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm"
                            placeholder="Seu nome"
                        />
                        <button
                            onClick={handleSaveProfile}
                            disabled={savingProfile || !profiles[0]}
                            className="premium-button-primary w-full"
                        >
                            {savingProfile ? <Loader2 className="animate-spin" size={16} /> : 'Salvar perfil'}
                        </button>
                    </div>
                </div>

                <div className="premium-card p-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Database size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-zinc-950 tracking-tight">Gerenciamento de dados</h2>
                            <p className="text-xs text-zinc-500 font-medium">Repopular dados de desenvolvimento.</p>
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                            <CheckCircle2 size={16} /> Dados de exemplo carregados com sucesso!
                        </div>
                    )}

                    <button
                        onClick={handleSeed}
                        disabled={loading}
                        className={cn('premium-button-primary w-full flex items-center justify-center gap-2', loading && 'opacity-70 cursor-not-allowed')}
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCcw size={18} />}
                        {loading ? 'Processando...' : 'Resetar e Carregar Dados de Exemplo'}
                    </button>
                </div>
            </div>
        </div>
    )
}
