import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const isProd = import.meta.env.PROD

function isPlaceholder(value: string | undefined, placeholders: string[] = []) {
    return !value || value.trim() === '' || placeholders.includes(value)
}

const placeholderUrls = [
    'sua_url_aqui',
    'https://iglijiqvjtzupgxkbsji.supabase.co',
]

const placeholderKeys = [
    'sua_chave_anon_aqui',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbGlqaXF2anR6dXBneGtic2ppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTQ3MzQsImV4cCI6MjA4NzIzMDczNH0.H8KqQs_w6DM4QN5GXDvTBWRJEeNnIjDD97-AhDPppEI',
]

if (isPlaceholder(supabaseUrl, placeholderUrls) || isPlaceholder(supabaseAnonKey, placeholderKeys)) {
    const message = 'Missing Supabase env vars. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    if (isProd) {
        throw new Error(message)
    }
    console.warn(message)
}

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client cannot be initialized without VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
