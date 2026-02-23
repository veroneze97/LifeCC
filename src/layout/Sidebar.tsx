import { NavLink } from 'react-router-dom'
import {
    LayoutDashboard,
    Wallet,
    ArrowRightLeft as History,
    Settings,
    TrendingUp as Activity,
    Calculator,
    ShieldCheck,
    FileText,
    FileUp
} from 'lucide-react'
import { cn } from '../utils/utils'

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: History, label: 'Fluxo de Caixa', path: '/cashflow' },
    { icon: Calculator, label: 'Plantões', path: '/shifts' },
    { icon: Wallet, label: 'Patrimônio', path: '/networth' },
    { icon: Activity, label: 'Performance', path: '/performance' },
    { icon: FileText, label: 'Relatórios', path: '/report' },
    { icon: FileUp, label: 'Importar Extrato', path: '/settings/import' },
]

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (value: boolean) => void
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen transition-all duration-500 z-50 flex flex-col pt-8 pb-6 px-4 bg-card border-r border-border",
            isCollapsed ? "w-20" : "w-[260px]"
        )}>
            {/* Brand */}
            <div className={cn("flex items-center gap-3 mb-10 relative", isCollapsed ? "justify-center" : "px-2")}>
                <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-brand" size={20} strokeWidth={2} />
                </div>
                {!isCollapsed && (
                    <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
                        <span className="text-lg font-bold text-foreground tracking-tight leading-none">
                            LifeCC
                        </span>
                        <span className="text-[10px] text-muted font-medium tracking-widest uppercase mt-1">
                            Life Operating System
                        </span>
                    </div>
                )}

                {/* Collapse Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-10 bg-card border border-border rounded-r-lg flex items-center justify-center text-muted hover:text-brand transition-all hover:bg-card z-50",
                        isCollapsed ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    )}
                >
                    <div className={cn("transition-transform duration-500", isCollapsed ? "" : "rotate-180")}>
                        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
                {!isCollapsed && (
                    <p className="text-[10px] font-semibold text-muted/70 uppercase tracking-widest mx-3 mb-3">Menu</p>
                )}
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 rounded-lg transition-all duration-300 relative group",
                            isCollapsed ? "justify-center p-3" : "py-2.5 px-3",
                            isActive
                                ? "bg-brand/10 text-brand"
                                : "text-muted hover:bg-card hover:text-foreground"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                                {!isCollapsed && (
                                    <span className={cn("text-sm transition-colors", isActive ? "font-semibold" : "font-medium")}>
                                        {item.label}
                                    </span>
                                )}
                                {/* Indicador Ativo */}
                                {isActive && (
                                    <div className="absolute left-0 w-[3px] h-5 bg-brand rounded-r-full top-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-border">
                <NavLink
                    to="/settings"
                    className={({ isActive }) => cn(
                        "flex items-center gap-3 rounded-lg transition-all relative group",
                        isCollapsed ? "justify-center p-3" : "py-2.5 px-3",
                        isActive ? "bg-brand/10 text-brand" : "text-muted hover:bg-card hover:text-foreground"
                    )}
                >
                    {({ isActive }) => (
                        <>
                            <Settings size={18} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                            {!isCollapsed && <span className={cn("text-sm", isActive ? "font-semibold" : "font-medium")}>Configurações</span>}
                            {isActive && (
                                <div className="absolute left-0 w-[3px] h-5 bg-brand rounded-r-full top-1/2 -translate-y-1/2" />
                            )}
                        </>
                    )}
                </NavLink>

                {!isCollapsed && (
                    <div className="mt-6 p-4 bg-card rounded-xl relative overflow-hidden border border-border">
                        <div className="relative z-10">
                            <p className="text-[10px] font-medium text-muted uppercase tracking-widest mb-1">Assinatura</p>
                            <p className="text-xs font-semibold text-foreground">SaaS Premium</p>
                        </div>
                        <Activity size={60} className="absolute -right-4 -bottom-4 text-brand/5 -rotate-12" />
                    </div>
                )}
            </div>
        </aside>
    )
}
