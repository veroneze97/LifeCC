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
            const queryProfiles = () => supabase
                .from('profiles')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true })

            const { data, error } = await queryProfiles()

            if (error) throw error

            let nextProfiles = data ?? []

            if (nextProfiles.length === 0) {
                // Handles the auth/profile bootstrap race on first login.
                await new Promise((resolve) => setTimeout(resolve, 350))

                const { data: retryData, error: retryError } = await queryProfiles()
                if (retryError) throw retryError

                nextProfiles = retryData ?? []
            }

            setProfiles(nextProfiles)
        } catch (err) {
            console.error('Error fetching profiles:', err)
            setProfiles([])
        } finally {
            setLoadingProfiles(false)
        }
    }, [user])

    useEffect(() => {
        fetchProfiles()
    }, [fetchProfiles])

    useEffect(() => {
        if (!user) return

        const handleDataChanged = () => {
            if (profiles.length === 0) {
                void fetchProfiles()
            }
        }

        window.addEventListener('lifecc-data-changed', handleDataChanged)

        return () => {
            window.removeEventListener('lifecc-data-changed', handleDataChanged)
        }
    }, [user, profiles.length, fetchProfiles])

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
