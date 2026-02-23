import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, FileSpreadsheet, Loader2, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useFilter } from '../../hooks/useFilter'
import { supabase } from '../../services/supabase'
import { categories } from '../../utils/constants'
import { ParsedImportResult, ParsedImportRow, parseStatementCsv } from '../../utils/csvImport'
import { cn, formatCurrency } from '../../utils/utils'

interface AccountOption {
    id: string
    name: string
}

interface ClassifiedRow {
    cleanDescription: string
    category: string
    confidence: number
}

interface ReviewRow {
    id: string
    date: string
    originalDescription: string
    cleanDescription: string
    category: string
    type: 'income' | 'expense'
    amount: number
    confidence: number
    isSelected: boolean
    isPossibleDuplicate: boolean
}

interface ImportSummary {
    imported: number
    ignoredDuplicates: number
}

const BATCH_SIZE = 50

export function ImportPage() {
    const { user } = useAuth()
    const { profiles, selectedProfileId } = useFilter()

    const [accounts, setAccounts] = useState<AccountOption[]>([])
    const [loadingAccounts, setLoadingAccounts] = useState(false)
    const [selectedAccountId, setSelectedAccountId] = useState('')

    const [fileName, setFileName] = useState('')
    const [parseMeta, setParseMeta] = useState<ParsedImportResult | null>(null)
    const [reviewRows, setReviewRows] = useState<ReviewRow[]>([])

    const [parsing, setParsing] = useState(false)
    const [classifying, setClassifying] = useState(false)
    const [classificationProgress, setClassificationProgress] = useState({ done: 0, total: 0 })

    const [showReviewOnly, setShowReviewOnly] = useState(false)

    const [error, setError] = useState<string | null>(null)
    const [importMessage, setImportMessage] = useState<string | null>(null)
    const [importing, setImporting] = useState(false)
    const [importSummary, setImportSummary] = useState<ImportSummary | null>(null)

    const activeProfileId = useMemo(() => {
        if (selectedProfileId !== 'all') return selectedProfileId
        return profiles[0]?.id ?? ''
    }, [profiles, selectedProfileId])

    const selectedCount = useMemo(() => reviewRows.filter((row) => row.isSelected).length, [reviewRows])
    const reviewCount = useMemo(() => reviewRows.filter((row) => row.confidence < 80).length, [reviewRows])
    const duplicateCount = useMemo(() => reviewRows.filter((row) => row.isPossibleDuplicate).length, [reviewRows])

    const visibleRows = useMemo(() => {
        if (!showReviewOnly) return reviewRows
        return reviewRows.filter((row) => row.confidence < 80)
    }, [reviewRows, showReviewOnly])

    const canImport = selectedAccountId !== '' && selectedCount > 0 && !parsing && !classifying && !importing

    useEffect(() => {
        let isMounted = true

        async function fetchAccounts() {
            if (!user || !activeProfileId) {
                if (isMounted) {
                    setAccounts([])
                    setSelectedAccountId('')
                }
                return
            }

            setLoadingAccounts(true)
            try {
                const { data, error: fetchError } = await supabase
                    .from('accounts')
                    .select('id, name')
                    .eq('user_id', user.id)
                    .eq('profile_id', activeProfileId)
                    .order('name', { ascending: true })

                if (fetchError) throw fetchError
                if (!isMounted) return

                const nextAccounts = data ?? []
                setAccounts(nextAccounts)
                setSelectedAccountId((currentId) => {
                    if (currentId && nextAccounts.some((item) => item.id === currentId)) {
                        return currentId
                    }
                    return nextAccounts[0]?.id ?? ''
                })
            } catch (fetchError) {
                console.error('Erro ao carregar contas para importacao:', fetchError)
                if (isMounted) {
                    setAccounts([])
                    setSelectedAccountId('')
                }
            } finally {
                if (isMounted) setLoadingAccounts(false)
            }
        }

        void fetchAccounts()

        return () => {
            isMounted = false
        }
    }, [activeProfileId, user])

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        setError(null)
        setImportMessage(null)
        setImportSummary(null)

        if (!file) {
            resetImportState()
            return
        }

        setParsing(true)
        setFileName(file.name)

        try {
            const fileContent = await file.text()
            const parsed = parseStatementCsv(fileContent)

            if (parsed.totalRows === 0) {
                throw new Error('Nao encontramos linhas validas no CSV enviado.')
            }
            if (parsed.parsedRows === 0) {
                throw new Error('Nao foi possivel identificar colunas de data, descricao e valor neste arquivo.')
            }

            setParseMeta(parsed)

            const baseRows = parsed.rows.map((row, index) => createInitialReviewRow(row, index))
            setReviewRows(baseRows)

            await classifyRows(baseRows)
        } catch (parseError) {
            const message = parseError instanceof Error ? parseError.message : 'Falha ao ler o arquivo CSV.'
            setError(message)
            setParseMeta(null)
            setReviewRows([])
        } finally {
            setParsing(false)
            event.target.value = ''
        }
    }

    async function classifyRows(baseRows: ReviewRow[]) {
        if (baseRows.length === 0) return

        setClassifying(true)
        setClassificationProgress({ done: 0, total: baseRows.length })

        const updatedRows = [...baseRows]

        try {
            for (let start = 0; start < baseRows.length; start += BATCH_SIZE) {
                const chunk = baseRows.slice(start, start + BATCH_SIZE)
                const classifiedChunk = await classifyBatch(chunk)

                chunk.forEach((_, localIndex) => {
                    const globalIndex = start + localIndex
                    const classified = classifiedChunk[localIndex]
                    if (!classified) return

                    updatedRows[globalIndex] = {
                        ...updatedRows[globalIndex],
                        cleanDescription: classified.cleanDescription,
                        category: classified.category,
                        confidence: classified.confidence,
                    }
                })

                setClassificationProgress({
                    done: Math.min(start + chunk.length, baseRows.length),
                    total: baseRows.length,
                })
                setReviewRows(markPossibleDuplicates(updatedRows))
            }
        } catch (classificationError) {
            console.error('Erro ao classificar transacoes:', classificationError)
            setError('Falha ao classificar com IA. Revise manualmente os campos antes de importar.')
            setReviewRows(markPossibleDuplicates(updatedRows))
        } finally {
            setClassifying(false)
        }
    }

    async function classifyBatch(chunk: ReviewRow[]): Promise<ClassifiedRow[]> {
        const payloadRows = chunk.map((row) => ({
            date: row.date,
            description: row.originalDescription,
            amount: row.amount,
            type: row.type,
        }))

        const { data, error: invokeError } = await supabase.functions.invoke('classify-transactions', {
            body: {
                rows: payloadRows,
                categories,
            },
        })

        if (invokeError) {
            throw new Error(invokeError.message || 'Erro ao invocar edge function')
        }

        const rawRows = data?.rows
        if (!Array.isArray(rawRows)) {
            throw new Error('Resposta invalida da edge function')
        }

        return chunk.map((row, index) => sanitizeClassifiedRow(rawRows[index], row))
    }

    function handleCleanDescriptionChange(id: string, value: string) {
        setReviewRows((currentRows) => {
            const updated = currentRows.map((row) => row.id === id ? { ...row, cleanDescription: value } : row)
            return markPossibleDuplicates(updated)
        })
    }

    function handleCategoryChange(id: string, value: string) {
        setReviewRows((currentRows) => currentRows.map((row) => row.id === id ? { ...row, category: value } : row))
    }

    function handleToggleRow(id: string, checked: boolean) {
        setReviewRows((currentRows) => currentRows.map((row) => row.id === id ? { ...row, isSelected: checked } : row))
    }

    async function handleImportTransactions() {
        setError(null)
        setImportMessage(null)

        const dedupedRows = markPossibleDuplicates([...reviewRows])
        setReviewRows(dedupedRows)

        if (!user) {
            const message = 'Faca login para importar transacoes.'
            setError(message)
            alert(message)
            return
        }

        if (!activeProfileId) {
            const message = 'Nenhum perfil ativo encontrado para importar.'
            setError(message)
            alert(message)
            return
        }

        if (!selectedAccountId) {
            const message = 'Selecione uma conta de destino antes de importar.'
            setError(message)
            alert(message)
            return
        }

        const importableRows = dedupedRows.filter((row) => row.isSelected)
        const ignoredDuplicates = dedupedRows.filter((row) => row.isPossibleDuplicate && !row.isSelected).length

        if (importableRows.length === 0) {
            setImportMessage('Nenhuma linha selecionada para importar.')
            return
        }

        setImporting(true)
        try {
            for (let start = 0; start < importableRows.length; start += BATCH_SIZE) {
                const chunk = importableRows.slice(start, start + BATCH_SIZE)
                const payload = chunk.map((row) => ({
                    user_id: user.id,
                    profile_id: activeProfileId,
                    account_id: selectedAccountId,
                    date: row.date,
                    type: row.type,
                    category: row.category,
                    description: row.cleanDescription.trim() || row.originalDescription.trim(),
                    amount: row.amount,
                    status: 'paid' as const,
                }))

                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert(payload)

                if (insertError) throw insertError
            }

            window.dispatchEvent(new CustomEvent('lifecc-data-changed'))
            setImportSummary({
                imported: importableRows.length,
                ignoredDuplicates,
            })
            setImportMessage('Importacao concluida com sucesso.')
        } catch (importError) {
            const message = importError instanceof Error
                ? importError.message
                : 'Falha ao importar transacoes. Tente novamente.'
            setError(message)
            alert(message)
        } finally {
            setImporting(false)
        }
    }

    function resetImportState() {
        setFileName('')
        setParseMeta(null)
        setReviewRows([])
        setClassificationProgress({ done: 0, total: 0 })
        setShowReviewOnly(false)
        setImportSummary(null)
        setImporting(false)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div>
                <h1 className="text-4xl font-black text-zinc-950 tracking-tighter">Importar Extrato</h1>
                <p className="text-zinc-500 text-sm font-medium mt-1">
                    Upload, classificacao com IA e revisao premium antes da importacao.
                </p>
            </div>

            <div className="premium-card p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Arquivo CSV</label>
                        <label className="flex items-center justify-between gap-3 border border-zinc-200 bg-zinc-50 rounded-2xl px-4 py-3 cursor-pointer hover:border-zinc-300 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                                <FileSpreadsheet size={18} className="text-zinc-500 shrink-0" />
                                <span className="text-sm text-zinc-700 truncate">{fileName || 'Selecionar arquivo .csv'}</span>
                            </div>
                            <span className="h-9 px-4 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-[0.18em] flex items-center gap-2 shrink-0">
                                <Upload size={14} /> Upload
                            </span>
                            <input
                                type="file"
                                accept=".csv,text/csv"
                                className="hidden"
                                onChange={(changeEvent) => {
                                    void handleFileChange(changeEvent)
                                }}
                            />
                        </label>
                    </div>

                    <div className="w-full lg:w-[320px] space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Conta de destino</label>
                        <select
                            value={selectedAccountId}
                            onChange={(changeEvent) => setSelectedAccountId(changeEvent.target.value)}
                            disabled={loadingAccounts || accounts.length === 0}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm focus:ring-4 focus:ring-black/5 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {accounts.length === 0 ? (
                                <option value="">{loadingAccounts ? 'Carregando contas...' : 'Nenhuma conta encontrada'}</option>
                            ) : (
                                accounts.map((account) => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {(parsing || classifying) && (
                    <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                        <Loader2 size={16} className="animate-spin" />
                        {parsing ? 'Processando CSV...' : `Classificando com IA... ${classificationProgress.done}/${classificationProgress.total}`}
                    </div>
                )}

                {error && (
                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl p-3">
                        <AlertCircle size={16} /> {error}
                    </div>
                )}

                {importMessage && (
                    <div className="flex items-center gap-2 text-emerald-700 text-sm bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <CheckCircle2 size={16} /> {importMessage}
                    </div>
                )}

                {importSummary && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <span><strong>{importSummary.imported}</strong> importadas</span>
                        <span><strong>{importSummary.ignoredDuplicates}</strong> duplicadas ignoradas</span>
                        <Link to="/cashflow" className="underline font-semibold">
                            Ver no Fluxo de Caixa
                        </Link>
                    </div>
                )}

                {parseMeta && (
                    <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">
                        Delimitador: <span className="text-zinc-900">{parseMeta.delimiter === ';' ? ';' : ','}</span>
                        {' | '}Linhas: <span className="text-zinc-900">{reviewRows.length}</span>
                        {' | '}Revisar: <span className="text-zinc-900">{reviewCount}</span>
                        {' | '}Possiveis duplicados: <span className="text-zinc-900">{duplicateCount}</span>
                        {' | '}Selecionadas: <span className="text-zinc-900">{selectedCount}</span>
                    </div>
                )}
            </div>

            <div className="premium-card p-8 space-y-5 overflow-hidden">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h2 className="text-lg font-black text-zinc-950 tracking-tight">Revisao de transacoes</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm text-zinc-700">
                            <input
                                type="checkbox"
                                checked={showReviewOnly}
                                onChange={(changeEvent) => setShowReviewOnly(changeEvent.target.checked)}
                                className="w-4 h-4 rounded border-zinc-300"
                            />
                            Mostrar so Revisar
                        </label>

                        <button
                            type="button"
                            onClick={() => {
                                void handleImportTransactions()
                            }}
                            disabled={!canImport}
                            className="h-11 px-6 bg-brand text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {importing ? 'Importando...' : 'Importar transacoes'}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1280px] text-sm">
                        <thead>
                            <tr className="border-b border-zinc-200 text-zinc-500 text-xs uppercase tracking-widest">
                                <th className="text-left py-3 pr-3 font-black">Importar</th>
                                <th className="text-left py-3 pr-3 font-black">Date</th>
                                <th className="text-left py-3 pr-3 font-black">Original Description</th>
                                <th className="text-left py-3 pr-3 font-black">Clean Description</th>
                                <th className="text-left py-3 pr-3 font-black">Category</th>
                                <th className="text-left py-3 pr-3 font-black">Type</th>
                                <th className="text-right py-3 pr-3 font-black">Amount</th>
                                <th className="text-left py-3 font-black">Confidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => {
                                const isAuto = row.confidence >= 80
                                return (
                                    <tr key={row.id} className="border-b border-zinc-100/80 align-top">
                                        <td className="py-3 pr-3">
                                            <input
                                                type="checkbox"
                                                checked={row.isSelected}
                                                onChange={(changeEvent) => handleToggleRow(row.id, changeEvent.target.checked)}
                                                className="w-4 h-4 rounded border-zinc-300"
                                            />
                                        </td>
                                        <td className="py-3 pr-3 text-zinc-700 font-medium whitespace-nowrap">{row.date}</td>
                                        <td className="py-3 pr-3 text-zinc-900">{row.originalDescription}</td>
                                        <td className="py-3 pr-3">
                                            <input
                                                value={row.cleanDescription}
                                                onChange={(changeEvent) => handleCleanDescriptionChange(row.id, changeEvent.target.value)}
                                                className="w-full min-w-[240px] bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                                            />
                                            {row.isPossibleDuplicate && (
                                                <span className="inline-flex mt-2 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-700">
                                                    Possivel duplicado
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 pr-3">
                                            <select
                                                value={row.category}
                                                onChange={(changeEvent) => handleCategoryChange(row.id, changeEvent.target.value)}
                                                className="w-full min-w-[170px] bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-sm"
                                            >
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="py-3 pr-3 whitespace-nowrap">
                                            <span className={cn(
                                                'px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                                                row.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                                            )}>
                                                {row.type}
                                            </span>
                                        </td>
                                        <td className="py-3 pr-3 text-right font-bold text-zinc-950 whitespace-nowrap">
                                            {row.type === 'expense' ? '-' : '+'}
                                            {formatCurrency(row.amount)}
                                        </td>
                                        <td className="py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    'px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider',
                                                    isAuto ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                )}>
                                                    {isAuto ? 'Auto' : 'Revisar'}
                                                </span>
                                                <span className="text-xs font-bold text-zinc-600">{row.confidence}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {visibleRows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-10 text-center text-zinc-500">
                                        {reviewRows.length === 0
                                            ? 'Envie um CSV para iniciar a revisao.'
                                            : 'Nenhuma linha encontrada no filtro atual.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

function createInitialReviewRow(row: ParsedImportRow, index: number): ReviewRow {
    return {
        id: `${index}-${row.date}-${row.description.slice(0, 20)}`,
        date: row.date,
        originalDescription: row.description,
        cleanDescription: row.description,
        category: 'Outros',
        type: row.type,
        amount: row.amount,
        confidence: 0,
        isSelected: true,
        isPossibleDuplicate: false,
    }
}

function sanitizeClassifiedRow(raw: unknown, fallback: ReviewRow): ClassifiedRow {
    const fallbackCategory = categories.includes(fallback.category) ? fallback.category : 'Outros'

    if (!raw || typeof raw !== 'object') {
        return {
            cleanDescription: fallback.cleanDescription,
            category: fallbackCategory,
            confidence: 10,
        }
    }

    const candidate = raw as Partial<ClassifiedRow>

    const cleanDescription = typeof candidate.cleanDescription === 'string' && candidate.cleanDescription.trim()
        ? candidate.cleanDescription.trim().slice(0, 120)
        : fallback.cleanDescription

    const category = typeof candidate.category === 'string' && categories.includes(candidate.category)
        ? candidate.category
        : 'Outros'

    const numericConfidence = Number(candidate.confidence)
    const confidence = Number.isFinite(numericConfidence)
        ? Math.max(0, Math.min(100, Math.round(numericConfidence)))
        : 10

    return {
        cleanDescription,
        category,
        confidence,
    }
}

function markPossibleDuplicates(rows: ReviewRow[]): ReviewRow[] {
    if (rows.length <= 1) {
        return rows.map((row) => ({ ...row, isPossibleDuplicate: false }))
    }

    const duplicateIds = new Set<string>()

    for (let i = 0; i < rows.length; i += 1) {
        for (let j = i + 1; j < rows.length; j += 1) {
            const first = rows[i]
            const second = rows[j]

            if (first.date !== second.date) continue
            if (Math.abs(first.amount - second.amount) > 0.009) continue
            if (!isSimilarDescription(first.cleanDescription, second.cleanDescription)) continue

            duplicateIds.add(first.id)
            duplicateIds.add(second.id)
        }
    }

    return rows.map((row) => {
        const isPossibleDuplicate = duplicateIds.has(row.id)
        const isSelected = isPossibleDuplicate && !row.isPossibleDuplicate ? false : row.isSelected

        return {
            ...row,
            isPossibleDuplicate,
            isSelected,
        }
    })
}

function isSimilarDescription(left: string, right: string): boolean {
    const a = normalizeDescription(left)
    const b = normalizeDescription(right)

    if (!a || !b) return false
    if (a === b) return true

    if (a.length >= 7 && b.length >= 7 && (a.includes(b) || b.includes(a))) {
        return true
    }

    const tokensA = tokenSet(a)
    const tokensB = tokenSet(b)
    if (tokensA.size === 0 || tokensB.size === 0) return false

    let common = 0
    tokensA.forEach((token) => {
        if (tokensB.has(token)) common += 1
    })

    const union = new Set([...tokensA, ...tokensB]).size
    const similarity = union > 0 ? common / union : 0
    return similarity >= 0.7
}

function tokenSet(value: string): Set<string> {
    return new Set(value.split(' ').filter((token) => token.length >= 2))
}

function normalizeDescription(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}
