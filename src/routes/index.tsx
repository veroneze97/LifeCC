import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { PortfolioPage } from '../pages/portfolio/PortfolioPage'
import { PerformancePage } from '../pages/performance/PerformancePage'
import { HistoryPage } from '../pages/history/HistoryPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patrimonio" element={<PortfolioPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/historico" element={<HistoryPage />} />
                <Route path="/configuracoes" element={<div className="p-8 text-center text-zinc-400 font-bold animate-pulse uppercase tracking-[0.2em]">Configurações em Breve</div>} />
            </Route>
        </Routes>
    )
}
