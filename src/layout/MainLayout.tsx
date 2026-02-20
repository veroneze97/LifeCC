import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import { cn } from '../utils/utils'

export function MainLayout() {
    const { loading } = useAuth()
    const [isCollapsed, setIsCollapsed] = useState(false)

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-[3px] border-border border-t-brand rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex text-foreground">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            <div className={cn(
                "flex-1 flex flex-col transition-all duration-500 min-w-0",
                isCollapsed ? "pl-20" : "pl-[260px]"
            )}>
                <Header />
                <main className="flex-1 w-full max-w-[1440px] p-6 lg:p-8 2xl:p-10 mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
