import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (typeof document === 'undefined') return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
                    {/* Backdrop Premium */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-zinc-400/35 backdrop-blur-md"
                    />

                    {/* Content Glassmorphism Influence */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative z-[101] w-full max-w-3xl max-h-[92vh] bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_30px_100px_rgba(0,0,0,0.3)] border border-white/20 overflow-hidden flex flex-col"
                    >
                        <div className="px-5 py-5 sm:px-8 sm:py-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50 shrink-0">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tighter">{title}</h2>
                                <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-1 text-left">Action Required</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center hover:bg-zinc-200/50 rounded-2xl transition-all text-zinc-400 hover:text-zinc-950 active:scale-90"
                            >
                                <X size={24} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="px-5 py-5 sm:px-8 sm:py-8 overflow-y-auto custom-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    )
}
