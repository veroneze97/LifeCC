import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'

import { ensureUserBootstrap } from '../services/bootstrap'
import { supabase } from '../services/supabase'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const bootstrappedUserRef = useRef<string | null>(null)

    const bootstrapUser = useCallback(async (targetUser: User | null) => {
        if (!targetUser) return
        if (bootstrappedUserRef.current === targetUser.id) return

        await ensureUserBootstrap(targetUser)
        bootstrappedUserRef.current = targetUser.id
        window.dispatchEvent(new CustomEvent('lifecc-data-changed'))
    }, [])

    useEffect(() => {
        let isMounted = true

        async function loadSession() {
            const { data, error } = await supabase.auth.getSession()
            if (error) {
                console.error('Failed to load session:', error)
            }

            const currentSession = data.session ?? null
            if (isMounted) {
                setSession(currentSession)
                setUser(currentSession?.user ?? null)
            }

            if (currentSession?.user) {
                try {
                    await bootstrapUser(currentSession.user)
                } catch (bootstrapError) {
                    console.error('Failed to bootstrap user data:', bootstrapError)
                }
            }

            if (isMounted) setLoading(false)
        }

        loadSession()

        const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
            setSession(nextSession ?? null)
            setUser(nextSession?.user ?? null)

            if (event === 'SIGNED_OUT') {
                bootstrappedUserRef.current = null
                setLoading(false)
                return
            }

            void (async () => {
                if (nextSession?.user) {
                    try {
                        await bootstrapUser(nextSession.user)
                    } catch (bootstrapError) {
                        console.error('Failed to bootstrap user data:', bootstrapError)
                    }
                }
                setLoading(false)
            })()
        })

        return () => {
            isMounted = false
            listener.subscription.unsubscribe()
        }
    }, [bootstrapUser])

    const signInWithPassword = useCallback(async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error

        if (data.user) {
            await bootstrapUser(data.user)
        }
    }, [bootstrapUser])

    const signUpWithPassword = useCallback(async (email: string, password: string, name?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name || undefined
                }
            }
        })

        if (error) throw error

        if (data.user && data.session) {
            await bootstrapUser(data.user)
        }
    }, [bootstrapUser])

    const signInWithGoogle = useCallback(async () => {
        const redirectTo = `${window.location.origin}${window.location.pathname}`
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo }
        })
        if (error) throw error
    }, [])

    const signOut = useCallback(async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            throw error
        }
        bootstrappedUserRef.current = null
    }, [])

    const value = useMemo(() => ({
        session,
        user,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signInWithGoogle,
        signOut
    }), [session, user, loading, signInWithPassword, signUpWithPassword, signInWithGoogle, signOut])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
