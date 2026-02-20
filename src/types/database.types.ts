export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    role: 'primary' | 'partner'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    name: string
                    role: 'primary' | 'partner'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    role?: 'primary' | 'partner'
                    created_at?: string
                }
            }
            accounts: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    name: string
                    type: 'checking' | 'cash' | 'credit' | 'investment'
                    balance_initial: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    name: string
                    type: 'checking' | 'cash' | 'credit' | 'investment'
                    balance_initial?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    name?: string
                    type?: 'checking' | 'cash' | 'credit' | 'investment'
                    balance_initial?: number
                    created_at?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    account_id: string
                    date: string
                    type: 'income' | 'expense'
                    category: string
                    description: string
                    amount: number
                    status: 'paid' | 'pending'
                    source: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    account_id: string
                    date: string
                    type: 'income' | 'expense'
                    category: string
                    description: string
                    amount: number
                    status: 'paid' | 'pending'
                    source?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    account_id?: string
                    date?: string
                    type?: 'income' | 'expense'
                    category?: string
                    description?: string
                    amount?: number
                    status?: 'paid' | 'pending'
                    source?: string | null
                    created_at?: string
                }
            }
            shifts: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    date: string
                    place: string
                    specialty: string | null
                    value_expected: number
                    value_received: number | null
                    status: 'scheduled' | 'done' | 'invoiced' | 'paid'
                    payment_due_date: string | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    date: string
                    place: string
                    specialty?: string | null
                    value_expected: number
                    value_received?: number | null
                    status: 'scheduled' | 'done' | 'invoiced' | 'paid'
                    payment_due_date?: string | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    date?: string
                    place?: string
                    specialty?: string | null
                    value_expected?: number
                    value_received?: number | null
                    status?: 'scheduled' | 'done' | 'invoiced' | 'paid'
                    payment_due_date?: string | null
                    notes?: string | null
                    created_at?: string
                }
            }
            assets: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    type: 'cash' | 'investment' | 'property' | 'vehicle' | 'other'
                    name: string
                    value: number
                    date_reference: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    type: 'cash' | 'investment' | 'property' | 'vehicle' | 'other'
                    name: string
                    value: number
                    date_reference: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    type?: 'cash' | 'investment' | 'property' | 'vehicle' | 'other'
                    name?: string
                    value?: number
                    date_reference?: string
                    created_at?: string
                }
            }
            liabilities: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    type: 'loan' | 'credit_card' | 'financing' | 'other'
                    name: string
                    value: number
                    date_reference: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    type: 'loan' | 'credit_card' | 'financing' | 'other'
                    name: string
                    value: number
                    date_reference: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    type?: 'loan' | 'credit_card' | 'financing' | 'other'
                    name?: string
                    value?: number
                    date_reference?: string
                    created_at?: string
                }
            }
            health_metrics: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    date: string
                    weight: number | null
                    workouts: number
                    steps: number | null
                    notes: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    date: string
                    weight?: number | null
                    workouts?: number
                    steps?: number | null
                    notes?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    date?: string
                    weight?: number | null
                    workouts?: number
                    steps?: number | null
                    notes?: string | null
                    created_at?: string
                }
            }
            goals: {
                Row: {
                    id: string
                    user_id: string
                    profile_id: string | null
                    name: string
                    target_value: number
                    target_date: string | null
                    monthly_contribution: number
                    expected_return_rate: number
                    scope: 'individual' | 'joint'
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    name: string
                    target_value: number
                    target_date?: string | null
                    monthly_contribution?: number
                    expected_return_rate?: number
                    scope?: 'individual' | 'joint'
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    profile_id?: string | null
                    name?: string
                    target_value?: number
                    target_date?: string | null
                    monthly_contribution?: number
                    expected_return_rate?: number
                    scope?: 'individual' | 'joint'
                    created_at?: string
                }
            }
        }
    }
}
