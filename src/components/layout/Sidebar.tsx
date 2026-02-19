import React from 'react'
import { LayoutDashboard, Wallet, TrendingUp, History, Settings, LogOut, Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../contexts/AuthContext'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Wallet, label: 'Patrimônio', path: '/patrimonio' },
    { icon: TrendingUp, label: 'Performance', path: '/performance' },
    { icon: History, label: 'Histórico', path: '/historico' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
]

export function Sidebar() {
    const location = useLocation()
    const { signOut } = useAuth()
    const [isOpen, setIsOpen] = React.useState(true)

    return (
        <>
            {/* Mobile Toggle */}
            <button
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside className={cn(
                "fixed left-0 top-0 h-screen bg-white border-r border-zinc-100 transition-all duration-300 z-40 flex flex-col",
                isOpen ? "w-64" : "w-0 -translate-x-full lg:w-20 lg:translate-x-0"
            )}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        L
                    </div>
                    {isOpen && <span className="font-bold text-xl tracking-tight">LifeCC</span>}
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-black text-white"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                            >
                                <item.icon size={20} className={cn(!isOpen && "mx-auto")} />
                                {isOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <button
                        onClick={signOut}
                        className="w-full flex items-center gap-3 px-3 py-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200"
                    >
                        <LogOut size={20} className={cn(!isOpen && "mx-auto")} />
                        {isOpen && <span className="font-medium">Sair</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}
