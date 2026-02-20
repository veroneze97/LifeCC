import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react'

import { supabase } from '../services/supabase'
import { months } from '../utils/constants'

interface Profile {
    id: string
    name: string
    role: string
}

interface FilterContextType {
    selectedMonth: string
    setSelectedMonth: (month: string) => void
    monthDate: Date
    selectedProfileId: string // 'all' or profile UUID
    setSelectedProfileId: (id: string) => void
    profiles: Profile[]
    loadingProfiles: boolean
    refreshProfiles: () => Promise<void>
}

export const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const currentMonthIndex = new Date().getMonth()
    const [selectedMonth, setSelectedMonth] = useState(months[currentMonthIndex])
    const [selectedProfileId, setSelectedProfileId] = useState('all')
    const [profiles, setProfiles] = useState<Profile[]>([])
    const [loadingProfiles, setLoadingProfiles] = useState(true)

    const monthDate = useMemo(() => {
        const year = new Date().getFullYear()
        const monthIndex = months.indexOf(selectedMonth)
        return new Date(year, monthIndex, 1)
    }, [selectedMonth])

    const fetchProfiles = useCallback(async () => {
        setLoadingProfiles(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', 'local')
                .order('created_at', { ascending: true })

            if (error) throw error
            if (data) setProfiles(data)
        } catch (err) {
            console.error('Error fetching profiles:', err)
        } finally {
            setLoadingProfiles(false)
        }
    }, [])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    const value = useMemo(() => ({
        selectedMonth,
        setSelectedMonth,
        monthDate,
        selectedProfileId,
        setSelectedProfileId,
        profiles,
        loadingProfiles,
        refreshProfiles: fetchProfiles
    }), [selectedMonth, monthDate, selectedProfileId, profiles, loadingProfiles, fetchProfiles])

    return (
        <FilterContext.Provider value={value}>
            {children}
        </FilterContext.Provider>
    )
}

