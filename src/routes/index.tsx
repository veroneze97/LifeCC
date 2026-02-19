import { Routes, Route } from 'react-router-dom'
import { MainLayout } from '../components/layout/MainLayout'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'

export function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patrimonio" element={<div>Patrimônio Content</div>} />
                <Route path="/performance" element={<div>Performance Content</div>} />
                <Route path="/historico" element={<div>Histórico Content</div>} />
                <Route path="/configuracoes" element={<div>Configurações Content</div>} />
            </Route>
        </Routes>
    )
}
