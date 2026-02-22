import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

export function PublicOnlyRoute({ children }: { children: ReactNode }) {
    const { session, loading } = useAuth()

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-[3px] border-border border-t-brand rounded-full animate-spin" />
            </div>
        )
    }

    if (session) {
        return <Navigate to="/dashboard" replace />
    }

    return <>{children}</>
}
