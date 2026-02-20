import { useFilter } from '../hooks/useFilter'
import { Users, User, ChevronDown } from 'lucide-react'
import { cn } from '../utils/utils'
import { useState } from 'react'

export function ProfileSwitcher({ variant = 'sidebar' }: { variant?: 'sidebar' | 'header' }) {
    const { profiles, selectedProfileId, setSelectedProfileId, loadingProfiles } = useFilter()
    const [isOpen, setIsOpen] = useState(false)

    if (loadingProfiles) return null

    const selectedProfile = profiles.find((p: any) => p.id === selectedProfileId)

    return (
        <div className={cn("relative", variant === 'sidebar' ? "mb-8" : "")}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center gap-3 p-2 rounded-xl transition-all duration-300",
                    variant === 'sidebar' ? "w-full bg-card border border-border shadow-sm" : "bg-card border border-border shadow-sm px-3",
                    "hover:border-brand/30 active:scale-95"
                )}
            >
                <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    selectedProfileId === 'all' ? "bg-brand/10 text-brand" : "bg-muted/10 text-muted"
                )}>
                    {selectedProfileId === 'all' ? <Users size={16} /> : <User size={16} />}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-[9px] font-semibold text-muted uppercase tracking-widest leading-none mb-1">Visualização</p>
                    <p className="text-xs font-semibold text-foreground truncate tracking-tight">
                        {selectedProfileId === 'all' ? 'Consolidado' : selectedProfile?.name}
                    </p>
                </div>
                <ChevronDown size={14} className={cn("text-muted transition-transform ml-1", isOpen && "rotate-180")} />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={cn(
                    "absolute top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-xl p-1.5 z-[100] animate-in fade-in slide-in-from-top-2 duration-200",
                    variant === 'sidebar' ? "left-0" : "right-0"
                )}>
                    <button
                        onClick={() => { setSelectedProfileId('all'); setIsOpen(false); }}
                        className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                            selectedProfileId === 'all' ? "bg-brand/10 text-brand font-semibold" : "text-muted hover:text-foreground hover:bg-muted/10"
                        )}
                    >
                        <Users size={16} />
                        <span className="text-xs tracking-tight">Consolidado</span>
                    </button>

                    <div className="h-px bg-border my-1.5 mx-2" />

                    {profiles.map((profile: any) => (
                        <button
                            key={profile.id}
                            onClick={() => { setSelectedProfileId(profile.id); setIsOpen(false); }}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                                selectedProfileId === profile.id ? "bg-brand/10 text-brand font-semibold" : "text-muted hover:text-foreground hover:bg-muted/10"
                            )}
                        >
                            <User size={16} />
                            <span className="text-xs tracking-tight">{profile.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
