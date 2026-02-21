import { useState, useEffect } from 'react'
import { Receipt, Calculator, Wallet } from 'lucide-react'

import { Modal } from './Modal'
import { TransactionForm } from './TransactionForm'
import { AssetLiabilityForm } from './AssetLiabilityForm'
import { ShiftForm } from './ShiftForm'


type Section = 'choice' | 'transaction' | 'shift' | 'asset' | 'liability'

export function GlobalAddModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [section, setSection] = useState<Section>('choice')

    // Reset ao fechar
    useEffect(() => {
        if (!isOpen) {
            setSection('choice')
        }
    }, [isOpen])

    const handleSuccess = () => {
        onClose()
    }

    const renderChoice = () => (
        <div className="grid grid-cols-1 gap-4">
            <button
                onClick={() => setSection('transaction')}
                className="group p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center gap-6 hover:bg-zinc-950 transition-all duration-300"
            >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Receipt className="text-zinc-600 group-hover:text-zinc-950" size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold text-zinc-950 group-hover:text-white transition-colors">Lançamento</h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">Receitas e despesas diárias</p>
                </div>
            </button>

            <button
                onClick={() => setSection('shift')}
                className="group p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center gap-6 hover:bg-zinc-950 transition-all duration-300"
            >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Calculator className="text-zinc-600 group-hover:text-zinc-950" size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold text-zinc-950 group-hover:text-white transition-colors">Plantão</h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">Gestão de turnos e pagamentos</p>
                </div>
            </button>

            <button
                onClick={() => setSection('asset')}
                className="group p-6 bg-zinc-50 border border-zinc-100 rounded-[2rem] flex items-center gap-6 hover:bg-zinc-950 transition-all duration-300"
            >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Wallet className="text-zinc-600 group-hover:text-zinc-950" size={24} />
                </div>
                <div className="text-left">
                    <h3 className="text-lg font-bold text-zinc-950 group-hover:text-white transition-colors">Ativo ou Passivo</h3>
                    <p className="text-sm text-zinc-500 group-hover:text-zinc-400 transition-colors">Bens, investimentos ou dívidas</p>
                </div>
            </button>
        </div>
    )

    const titles = {
        choice: 'O que deseja adicionar?',
        transaction: 'Novo Lançamento',
        shift: 'Cadastrar Plantão',
        asset: 'Novo Ativo',
        liability: 'Novo Passivo'
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={titles[section === 'asset' || section === 'liability' ? (section as 'asset' | 'liability') : section]}>
            {section === 'choice' && renderChoice()}
            {section === 'transaction' && (
                <TransactionForm onSuccess={handleSuccess} onCancel={() => setSection('choice')} />
            )}
            {section === 'shift' && (
                <ShiftForm onSuccess={handleSuccess} onCancel={() => setSection('choice')} />
            )}
            {(section === 'asset' || section === 'liability') && (
                <AssetLiabilityForm
                    type={section as 'asset' | 'liability'}
                    onSuccess={handleSuccess}
                    onCancel={() => setSection('choice')}
                />
            )}
        </Modal>
    )
}

