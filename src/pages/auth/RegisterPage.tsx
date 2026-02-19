import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowRight, Lock, Mail, User } from 'lucide-react'

export function RegisterPage() {
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            navigate('/login')
        }
    }

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            <div className="flex flex-col justify-center p-8 lg:p-24 bg-white">
                <div className="max-w-sm w-full mx-auto">
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-bold text-2xl mb-8">
                        L
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Comece agora</h1>
                    <p className="text-zinc-500 mb-8">Crie sua conta executiva no LifeCC.</p>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-zinc-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                                    placeholder="Seu nome"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

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
                            {loading ? 'Criando conta...' : 'Criar Conta'}
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-zinc-500">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="text-black font-semibold hover:underline">
                            Fazer Login
                        </Link>
                    </p>
                </div>
            </div>

            <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-950 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-sm font-medium border border-white/10 backdrop-blur-sm mb-6">
                        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" />
                        Ingresso Imediato
                    </div>
                    <h2 className="text-5xl font-bold leading-tight mb-6">
                        Sua jornada <br />
                        <span className="text-zinc-500">começa aqui.</span>
                    </h2>
                    <p className="text-xl text-zinc-400 max-w-md">
                        Junte-se a uma rede seleta de profissionais que gerenciam capital e tempo com precisão.
                    </p>
                </div>

                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
            </div>
        </div>
    )
}
