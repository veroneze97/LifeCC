import React, { useState, useEffect, useMemo, useCallback } from 'react'

import { useAuth } from '../hooks/useAuth'
import { supabase } from '../services/supabase'
import { months } from '../utils/constants'
import { FilterContext, Profile } from './FilterContextValue'

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth()
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
        if (!user) {
            setProfiles([])
            setSelectedProfileId('all')
            setLoadingProfiles(false)
            return
        }

        setLoadingProfiles(true)
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            if (error) throw error
            if (data) setProfiles(data)
        } catch (err) {
            console.error('Error fetching profiles:', err)
        } finally {
            setLoadingProfiles(false)
        }
    }, [user])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    useEffect(() => {
        if (profiles.length > 0 && (selectedProfileId === 'all' || !profiles.some((p) => p.id === selectedProfileId))) {
            setSelectedProfileId(profiles[0].id)
        }
        if (profiles.length === 0) {
            setSelectedProfileId('all')
        }
    }, [profiles, selectedProfileId])

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
