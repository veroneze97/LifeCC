import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://iglijiqvjtzupgxkbsji.supabase.co' || !supabaseAnonKey || supabaseAnonKey === 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGlqaXF2anR6dXBneGtic2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTQ3MzQsImV4cCI6MjA4NzIzMDczNH0.H8KqQs_w6DM4QN5GXDvTBWRJEeNnIjDD97-AhDPppEI') {
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
