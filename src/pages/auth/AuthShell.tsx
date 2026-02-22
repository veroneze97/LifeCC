import type { ReactNode } from 'react'

interface AuthShellProps {
    title: string
    subtitle: string
    children: ReactNode
    footer: ReactNode
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
            <div className="w-full max-w-md premium-card p-8 sm:p-10 space-y-8 shadow-xl">
                <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">LifeCC</p>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-950">{title}</h1>
                    <p className="text-sm text-zinc-500">{subtitle}</p>
                </div>

                {children}

                <div className="pt-2 border-t border-border text-center text-xs text-zinc-500">
                    {footer}
                </div>
            </div>
        </div>
    )
}
