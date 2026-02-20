import React, { createContext, useState } from 'react'

interface AuthContextType {
    user: { id: string; email: string; user_metadata: { full_name: string } } | null
    loading: boolean
    signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Versão Single-User: Usuário sempre fixo como "local"
    const [user] = useState({
        id: 'local',
        email: 'user@lifecc.com',
        user_metadata: { full_name: 'Usuário Local' }
    })
    const [loading] = useState(false)

    const signOut = async () => {
        console.log('Sign out disabled in Single-User mode')
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

