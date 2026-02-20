import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../layout/MainLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { CashflowPage } from '../pages/cashflow/CashflowPage'
import { ShiftsPage } from '../pages/shifts/ShiftsPage'
import { NetWorthPage } from '../pages/networth/NetWorthPage'
import { PerformancePage } from '../pages/performance/PerformancePage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { ReportPage } from '../pages/dashboard/ReportPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cashflow" element={<CashflowPage />} />
                <Route path="/shifts" element={<ShiftsPage />} />
                <Route path="/networth" element={<NetWorthPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/report" element={<ReportPage />} />
            </Route>
        </Routes>
    )
}
