import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'sua_url_aqui' || !supabaseAnonKey || supabaseAnonKey === 'sua_chave_anon_aqui') {
    console.warn('Supabase credentials missing or placeholders. App will use local/mock mode.')
}

function getValidUrl(url: string | undefined): string {
    if (!url || url === 'sua_url_aqui') return 'https://placeholder.supabase.co'

    let target = url.trim()
    if (!target.startsWith('http')) {
        target = `https://${target}`
    }

    try {
        new URL(target)
        return target
    } catch {
        console.error('Invalid Supabase URL:', url)
        return 'https://placeholder.supabase.co'
    }
}

const finalUrl = getValidUrl(supabaseUrl)
const finalKey = (supabaseAnonKey && supabaseAnonKey !== 'sua_chave_anon_aqui') ? supabaseAnonKey : 'placeholder'

export const supabase = createClient(finalUrl, finalKey)
