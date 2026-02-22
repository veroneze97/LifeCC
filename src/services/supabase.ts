import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const fallbackSupabaseUrl = 'https://iglijiqvjtzupgxkbsji.supabase.co'
const fallbackSupabaseAnonKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGlqaXF2anR6dXBneGtic2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTQ3MzQsImV4cCI6MjA4NzIzMDczNH0.H8KqQs_w6DM4QN5GXDvTBWRJEeNnIjDD97-AhDPppEI'

function isPlaceholder(value: string | undefined, placeholders: string[] = []) {
    return !value || value.trim() === '' || placeholders.includes(value)
}

const resolvedUrl = isPlaceholder(supabaseUrl, ['sua_url_aqui'])
    ? fallbackSupabaseUrl
    : supabaseUrl

const resolvedAnonKey = isPlaceholder(supabaseAnonKey, ['sua_chave_anon_aqui'])
    ? fallbackSupabaseAnonKey
    : supabaseAnonKey

if (resolvedUrl !== supabaseUrl || resolvedAnonKey !== supabaseAnonKey) {
    console.warn('Using fallback Supabase credentials. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.')
}

export const supabase = createClient(resolvedUrl, resolvedAnonKey)
