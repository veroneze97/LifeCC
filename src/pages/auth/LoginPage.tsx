import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

import { useAuth } from '../../hooks/useAuth'
import { AuthShell } from './AuthShell'

export function LoginPage() {
    const navigate = useNavigate()
    const { signInWithPassword, signInWithGoogle } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setLoading(true)
        setError(null)

        try {
            await signInWithPassword(email, password)
            navigate('/dashboard', { replace: true })
        } catch (err: any) {
            setError(err.message || 'Falha ao entrar. Verifique suas credenciais.')
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleSignIn() {
        setLoading(true)
        setError(null)
        try {
            await signInWithGoogle()
        } catch (err: any) {
            setError(err.message || 'Falha no login com Google.')
            setLoading(false)
        }
    }

    return (
        <AuthShell
            title="Entrar"
            subtitle="Acesse sua conta para continuar."
            footer={(
                <p>
                    Ainda nao tem conta?{' '}
                    <Link to="/signup" className="font-semibold text-zinc-900 hover:text-brand transition-colors">
                        Criar conta
                    </Link>
                </p>
            )}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">E-mail</label>
                    <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all"
                        placeholder="voce@exemplo.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Senha</label>
                    <input
                        type="password"
                        required
                        minLength={6}
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all"
                        placeholder="Sua senha"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-brand text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-brand/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Entrar'}
                </button>
            </form>

            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">ou</span>
                    <div className="h-px flex-1 bg-zinc-200" />
                </div>

                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full h-12 rounded-2xl border border-zinc-200 bg-white text-zinc-900 text-xs font-black uppercase tracking-[0.15em] hover:bg-zinc-50 transition-all disabled:opacity-70"
                >
                    Entrar com Google
                </button>
            </div>
        </AuthShell>
    )
}
