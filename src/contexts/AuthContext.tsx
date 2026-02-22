import React, { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

import { supabase } from '../services/supabase'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true

        async function loadSession() {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
                console.error('Failed to load session:', error)
            }
            if (isMounted) {
                setUser(data.session?.user ?? null)
                setLoading(false)
            }
        }

        loadSession()

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => {
            isMounted = false
            listener.subscription.unsubscribe()
        }
    }, [])

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
