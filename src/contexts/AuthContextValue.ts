import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export interface AuthContextType {
    session: Session | null
    user: User | null
    loading: boolean
    signInWithPassword: (email: string, password: string) => Promise<void>
    signUpWithPassword: (email: string, password: string, name?: string) => Promise<void>
    signInWithGoogle: () => Promise<void>
    signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
