import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowRight, Lock, Mail } from 'lucide-react'

export function LoginPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/')
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 lg:p-24 bg-white">
                <div className="max-w-sm w-full mx-auto">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-8">
                        L
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Bem-vindo de volta</h1>
                    <p className="text-zinc-500 mb-8">Acesse sua conta para gerenciar seu patrimônio.</p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-zinc-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 text-zinc-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Não tem uma conta?{' '}
                        <Link to="/register" className="text-black font-semibold hover:underline">
                            Cadastre-se
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm mb-6">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        V. 1.0 Alpha (MVP)
                    </div>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Gestão inteligente de <br />
                        <span className="text-zinc-500">renda variável.</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-md">
                        O LifeCC centraliza seus turnos, investimentos e patrimônio em uma única interface executiva.
                    </p>
                </div>

                <div className="relative z-10 p-8 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
                    <p className="text-lg italic text-zinc-300">
                        "A melhor forma de prever o futuro financeiro é organizá-lo hoje."
                    </p>
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />
            </div>
        </div>
    )
}
