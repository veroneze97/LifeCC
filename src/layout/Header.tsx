import { Plus, ChevronDown, User, Bell, Search, LogOut } from 'lucide-react'
import { useState } from 'react'
import { GlobalAddModal } from '../components/GlobalAddModal'
import { useAuth } from '../hooks/useAuth'
import { useFilter } from '../hooks/useFilter'
import { getDisplayName } from '../services/auth'
import { months } from '../utils/constants'
import { ProfileSwitcher } from './ProfileSwitcher'

export function Header() {
    const { selectedMonth, setSelectedMonth } = useFilter()
    const { user, signOut } = useAuth()
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const displayName = user ? getDisplayName(user) : 'Usuário'
    const roleName = user?.email || 'Conta autenticada'
    const avatarLabel = displayName.charAt(0).toUpperCase()

    async function handleSignOut() {
        try {
            await signOut()
        } catch (error) {
            console.error('Erro ao sair da conta:', error)
            alert('Nao foi possivel sair da conta. Tente novamente.')
        }
    }

    return (
        <header className="h-24 flex items-center justify-between px-6 lg:px-8 2xl:px-10 bg-background/80 backdrop-blur-xl sticky top-0 z-30 border-b border-border">
            <div className="flex items-center gap-6">
                <div className="relative group">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="appearance-none bg-card border border-border rounded-xl px-5 py-2.5 pr-10 text-xs font-semibold text-foreground tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-brand/50 transition-all cursor-pointer shadow-sm hover:border-brand/30"
                    >
                        {months.map((month: string) => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none group-hover:text-foreground transition-colors" size={16} />
                </div>

                <div className="w-px h-6 bg-border" />

                <ProfileSwitcher variant="header" />

                <div className="hidden md:flex items-center bg-card border border-border rounded-xl px-4 py-2 text-muted gap-3 focus-within:ring-2 focus-within:ring-brand/50 transition-all shadow-sm">
                    <Search size={16} />
                    <input
                        placeholder="Buscar..."
                        className="bg-transparent border-none outline-none text-xs font-medium text-foreground w-40 placeholder:text-muted/50"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2.5 text-muted hover:text-foreground bg-card shadow-sm border border-border rounded-xl transition-all hover:border-brand/30">
                    <Bell size={18} />
                </button>

                <div className="w-px h-6 bg-border" />

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="h-10 px-6 bg-brand text-white rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-brand/90 transition-all flex items-center gap-2 shadow-lg shadow-brand/20 active:scale-95 whitespace-nowrap"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Lançamento
                </button>

                <div className="flex items-center gap-3 group cursor-pointer ml-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-foreground leading-none">{displayName}</p>
                        <p className="text-[10px] font-medium text-muted uppercase tracking-widest mt-1">{roleName}</p>
                    </div>
                    <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center text-muted group-hover:text-foreground transition-all shadow-sm hover:border-brand/30">
                        {avatarLabel || <User size={18} strokeWidth={2} />}
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="hidden sm:flex h-10 px-4 bg-card border border-border rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-950 hover:border-zinc-300 transition-all items-center gap-2"
                    >
                        <LogOut size={14} />
                        Sair
                    </button>
                </div>

                <button
                    onClick={handleSignOut}
                    className="sm:hidden p-2.5 text-muted hover:text-foreground bg-card shadow-sm border border-border rounded-xl transition-all hover:border-brand/30"
                    aria-label="Sair"
                >
                    <LogOut size={18} />
                </button>
            </div>

            <GlobalAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </header>
    )
}
