import type { User } from '@supabase/supabase-js'

import { supabase } from './supabase'

export async function getCurrentUserId(): Promise<string> {
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
        throw new Error('Usuário não autenticado.')
    }
    return data.user.id
}

export function getDisplayName(user: User): string {
    const fullName = user.user_metadata?.full_name as string | undefined
    const name = user.user_metadata?.name as string | undefined
    const emailName = user.email?.split('@')[0]

    return fullName?.trim() || name?.trim() || emailName || 'Usuário'
}
