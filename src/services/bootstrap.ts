import type { User } from '@supabase/supabase-js'

import { getDisplayName } from './auth'
import { supabase } from './supabase'

export async function ensureUserBootstrap(user: User): Promise<{ profileId: string }> {
    const displayName = getDisplayName(user)

    let profileId: string | null = null

    const { data: existingProfiles, error: profileLookupError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'primary')
        .order('created_at', { ascending: true })
        .limit(1)

    if (profileLookupError) throw profileLookupError

    profileId = existingProfiles?.[0]?.id ?? null

    if (!profileId) {
        const { data: insertedProfile, error: insertProfileError } = await supabase
            .from('profiles')
            .insert({
                user_id: user.id,
                name: displayName,
                role: 'primary'
            })
            .select('id')
            .single()

        if (insertProfileError) {
            const { data: fallbackProfile, error: fallbackError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .eq('role', 'primary')
                .order('created_at', { ascending: true })
                .limit(1)
                .maybeSingle()

            if (fallbackError || !fallbackProfile) throw insertProfileError
            profileId = fallbackProfile.id
        } else {
            profileId = insertedProfile.id
        }
    }

    if (!profileId) {
        throw new Error('Falha ao preparar o profile principal do usuário.')
    }

    const { count: accountsCount, error: accountsCountError } = await supabase
        .from('accounts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)

    if (accountsCountError) throw accountsCountError

    if ((accountsCount ?? 0) === 0) {
        const { error: defaultAccountError } = await supabase.from('accounts').insert({
            user_id: user.id,
            profile_id: profileId,
            name: 'Conta Principal',
            type: 'checking',
            balance_initial: 0
        })

        if (defaultAccountError) throw defaultAccountError
    }

    return { profileId }
}
