import { createContext } from 'react'

export interface Profile {
    id: string
    name: string
    role: string
}

export interface FilterContextType {
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
