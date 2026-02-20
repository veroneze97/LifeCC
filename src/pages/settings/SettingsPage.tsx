import { useState } from 'react'
import { Database, RefreshCcw, CheckCircle2, AlertCircle, Loader2, Heart, UserPlus, Settings2, Trash2, Crown, Save, X } from 'lucide-react'
import { seedDatabase, clearLocalData } from '../../services/seed'
import { useFilter } from '../../hooks/useFilter'
import { supabase } from '../../services/supabase'
import { cn } from '../../utils/utils'

export function SettingsPage() {
    const { profiles, refreshProfiles, selectedProfileId, setSelectedProfileId } = useFilter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Perfil States
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editName, setEditName] = useState('')
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    async function handleAddPartner() {
        const name = prompt('Nome do parceiro(a):')
        if (!name) return

        setActionLoading('add')
        try {
            await supabase.from('profiles').insert([
                { user_id: 'local', name, role: 'partner' }
            ])
            await refreshProfiles()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleUpdateName(id: string) {
        if (!editName.trim()) return
        setActionLoading(id)
        try {
            await supabase.from('profiles').update({ name: editName }).eq('id', id).eq('user_id', 'local')
            await refreshProfiles()
            setEditingId(null)
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleSetPrimary(id: string) {
        setActionLoading(id)
        try {
            // No MVP, alternamos todos para partner e o selecionado para primary
            await supabase.from('profiles').update({ role: 'partner' }).eq('user_id', 'local')
            await supabase.from('profiles').update({ role: 'primary' }).eq('id', id)
            await refreshProfiles()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleRemovePartner(id: string) {
        if (!confirm('Tem certeza que deseja remover este perfil? Os dados vinculados permanecerão no banco, mas não aparecerão nos filtros individuais deste perfil.')) return
        setActionLoading(id)
        try {
            await supabase.from('profiles').delete().eq('id', id).eq('user_id', 'local')
            if (selectedProfileId === id) {
                setSelectedProfileId('all')
            }
            await refreshProfiles()
        } catch (err) {
            console.error(err)
        } finally {
            setActionLoading(null)
        }
    }

    async function handleSeed() {
        if (!confirm('Esta ação irá apagar seus dados atuais do usuário local e carregar dados de exemplo. Deseja continuar?')) {
            return
        }

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
                <p className="text-zinc-500 text-sm font-medium mt-1">Gerencie sua conta e preferências de dados.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Modo Casal Section */}
                <div className="premium-card p-10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20">
                                <Heart size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-zinc-950 tracking-tight">Modo Casal</h3>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                                    {profiles.length > 1 ? 'Ativado — Gestão de Perfis' : 'Desativado — Conta Individual'}
                                </p>
                            </div>
                        </div>
                        {profiles.length === 1 && (
                            <button
                                onClick={handleAddPartner}
                                disabled={actionLoading === 'add'}
                                className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                            >
                                {actionLoading === 'add' ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                                Ativar Modo Casal
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        {profiles.map((profile: any) => (
                            <div key={profile.id} className="p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                                        profile.role === 'primary' ? "bg-zinc-950 text-white" : "bg-zinc-200 text-zinc-500"
                                    )}>
                                        {profile.name[0]}
                                    </div>
                                    <div>
                                        {editingId === profile.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    className="bg-transparent border-b border-zinc-950 text-sm font-black text-zinc-950 focus:outline-none w-32"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    onKeyDown={e => e.key === 'Enter' && handleUpdateName(profile.id)}
                                                />
                                                <button onClick={() => handleUpdateName(profile.id)} className="p-1 hover:text-emerald-600 transition-colors">
                                                    <Save size={14} />
                                                </button>
                                                <button onClick={() => setEditingId(null)} className="p-1 hover:text-rose-600 transition-colors">
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-zinc-950">{profile.name}</h4>
                                                {profile.role === 'primary' && <Crown size={12} className="text-amber-500" />}
                                            </div>
                                        )}
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                            {profile.role === 'primary' ? 'Perfil Principal' : 'Parceiro(a)'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                    <button
                                        onClick={() => {
                                            setEditingId(profile.id)
                                            setEditName(profile.name)
                                        }}
                                        className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-zinc-950 transition-all"
                                        title="Editar Nome"
                                    >
                                        <Settings2 size={16} />
                                    </button>
                                    {profile.role !== 'primary' && (
                                        <button
                                            onClick={() => handleSetPrimary(profile.id)}
                                            className="p-2 hover:bg-white rounded-lg text-zinc-400 hover:text-amber-500 transition-all"
                                            title="Tornar Principal"
                                        >
                                            <Crown size={16} />
                                        </button>
                                    )}
                                    {profiles.length > 1 && (
                                        <button
                                            onClick={() => handleRemovePartner(profile.id)}
                                            className="p-2 hover:bg-white rounded-lg text-rose-300 hover:text-rose-600 transition-all"
                                            title="Remover Perfil"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="premium-card p-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-950 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-950/20">
                            <Database size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-zinc-950 tracking-tight">Gerenciamento de Dados</h3>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">Controle de registros locais</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-zinc-500 text-sm leading-relaxed">
                            Se você está começando agora ou quer apenas testar a interface do LifeCC, você pode carregar um conjunto de dados realistas para o usuário local.
                        </p>

                        <div className="p-6 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={16} className="text-zinc-950 mt-1 shrink-0" />
                                <p className="text-xs font-semibold text-zinc-600">
                                    Atenção: Carregar dados de exemplo substituirá todos os seus lançamentos atuais do usuário "local".
                                </p>
                            </div>

                            <button
                                onClick={handleSeed}
                                disabled={loading}
                                className="w-full h-14 bg-zinc-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-950/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : success ? (
                                    <CheckCircle2 size={18} className="text-emerald-400" />
                                ) : (
                                    <RefreshCcw size={18} />
                                )}
                                {loading ? 'Sincronizando...' : success ? 'Dados Carregados!' : 'Carregar dados de exemplo'}
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600">
                                <AlertCircle size={16} />
                                <p className="text-xs font-bold">{error}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="premium-card p-10 flex flex-col items-center justify-center text-center opacity-50 grayscale pointer-events-none">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <RefreshCcw size={32} className="text-zinc-300" />
                    </div>
                    <h3 className="text-lg font-black text-zinc-400 tracking-tight">Sincronização em Nuvem</h3>
                    <p className="text-[10px] text-zinc-300 font-black uppercase tracking-widest mt-2">Disponível em breve para assinantes Pro</p>
                </div>
            </div>
        </div>
    )
}
