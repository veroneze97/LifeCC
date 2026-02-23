import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '../layout/MainLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { SignupPage } from '../pages/auth/SignupPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { CashflowPage } from '../pages/cashflow/CashflowPage'
import { ShiftsPage } from '../pages/shifts/ShiftsPage'
import { NetWorthPage } from '../pages/networth/NetWorthPage'
import { PerformancePage } from '../pages/performance/PerformancePage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { ImportPage } from '../pages/settings/ImportPage'
import { ReportPage } from '../pages/dashboard/ReportPage'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'

export function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={(
                    <PublicOnlyRoute>
                        <LoginPage />
                    </PublicOnlyRoute>
                )}
            />
            <Route
                path="/signup"
                element={(
                    <PublicOnlyRoute>
                        <SignupPage />
                    </PublicOnlyRoute>
                )}
            />

            <Route
                element={(
                    <ProtectedRoute>
                        <MainLayout />
                    </ProtectedRoute>
                )}
            >
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cashflow" element={<CashflowPage />} />
                <Route path="/shifts" element={<ShiftsPage />} />
                <Route path="/networth" element={<NetWorthPage />} />
                <Route path="/performance" element={<PerformancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/import" element={<ImportPage />} />
                <Route path="/import" element={<Navigate to="/settings/import" replace />} />
                <Route path="/report" element={<ReportPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}
