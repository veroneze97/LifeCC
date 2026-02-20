import { LayoutDashboard, Wallet, TrendingUp, History, Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { cn } from '../../lib/utils'

const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Wallet, label: 'Patrimônio', path: '/patrimonio' },
    { icon: TrendingUp, label: 'Performance', path: '/performance' },
    { icon: History, label: 'Transações', path: '/historico' },
]

export function Sidebar() {
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-zinc-950 text-white transition-all duration-300 z-50 flex flex-col border-r border-white/5",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand */}
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl">
                            L
                        </div>
                        <span className="font-bold text-xl tracking-tight">LifeCC</span>
                    </div>
                )}
                {isCollapsed && (
                    <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl mx-auto">
                        L
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-white/10 text-white shadow-sm"
                                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon size={20} className={cn(isCollapsed && "mx-auto")} />
                            {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
                            {isActive && !isCollapsed && (
                                <div className="absolute left-0 w-1 h-4 bg-white rounded-full my-auto top-0 bottom-0" />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 space-y-2 border-t border-white/5">
                <Link
                    to="/configuracoes"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-white transition-all duration-200",
                        location.pathname === '/configuracoes' && "bg-white/10 text-white"
                    )}
                >
                    <Settings size={20} className={cn(isCollapsed && "mx-auto")} />
                    {!isCollapsed && <span className="font-medium text-sm">Configurações</span>}
                </Link>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-zinc-500 hover:text-white rounded-xl transition-all duration-200"
                >
                    {isCollapsed ? <ChevronRight size={20} className="mx-auto" /> : (
                        <>
                            <ChevronLeft size={20} />
                            <span className="font-medium text-sm">Recolher</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}
