import { Outlet, Navigate } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'

export function MainLayout() {
    const { user, loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#F8F9FA]">
                <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <Sidebar />
            <main className="lg:pl-64 transition-all duration-300">
                <div className="p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
