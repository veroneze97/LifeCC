export type TransactionType = 'income' | 'expense'

export interface ParsedImportRow {
    date: string
    description: string
    amount: number
    type: TransactionType
}

export interface ParsedImportResult {
    rows: ParsedImportRow[]
    totalRows: number
    parsedRows: number
    skippedRows: number
    delimiter: ',' | ';'
}

interface ColumnIndexes {
    dateIndex: number | null
    descriptionIndex: number | null
    amountIndex: number | null
    creditIndex: number | null
    debitIndex: number | null
}

const DATE_HEADER_ALIASES = [
    'data',
    'date',
    'datalancamento',
    'lancamento',
    'dtlancamento',
    'transactiondate',
    'posteddate'
]

const DESCRIPTION_HEADER_ALIASES = [
    'descricao',
    'description',
    'historico',
    'memo',
    'detalhe',
    'narrative',
    'title'
]

const AMOUNT_HEADER_ALIASES = [
    'valor',
    'amount',
    'valorrs',
    'quantia',
    'total',
    'montante'
]

const CREDIT_HEADER_ALIASES = ['credito', 'credit', 'entrada', 'income', 'inflow', 'deposito']
const DEBIT_HEADER_ALIASES = ['debito', 'debit', 'saida', 'expense', 'outflow', 'saque']

export function parseStatementCsv(content: string): ParsedImportResult {
    const normalizedContent = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')
    const delimiter = detectDelimiter(normalizedContent)
    const parsedRows = parseCsv(normalizedContent, delimiter)
    const nonEmptyRows = parsedRows.filter((row) => row.some((value) => value.trim() !== ''))

    if (nonEmptyRows.length === 0) {
        return {
            rows: [],
            totalRows: 0,
            parsedRows: 0,
            skippedRows: 0,
            delimiter
        }
    }

    const firstRow = nonEmptyRows[0]
    const headerAnalysis = detectHeaderAndColumns(firstRow)
    const rowsToProcess = headerAnalysis.hasHeader ? nonEmptyRows.slice(1) : nonEmptyRows

    const resultRows: ParsedImportRow[] = []

    for (const row of rowsToProcess) {
        const dateValue = pickDate(row, headerAnalysis.columns)
        const amountValue = pickAmount(row, headerAnalysis.columns)
        const descriptionValue = pickDescription(row, headerAnalysis.columns)

        if (!dateValue || amountValue === null || descriptionValue === null || amountValue === 0) {
            continue
        }

        const type: TransactionType = amountValue < 0 ? 'expense' : 'income'
        resultRows.push({
            date: dateValue,
            description: descriptionValue,
            amount: Math.abs(amountValue),
            type
        })
    }

    return {
        rows: resultRows,
        totalRows: rowsToProcess.length,
        parsedRows: resultRows.length,
        skippedRows: rowsToProcess.length - resultRows.length,
        delimiter
    }
}

function detectDelimiter(content: string): ',' | ';' {
    const lines = content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .slice(0, 10)

    let commaCount = 0
    let semicolonCount = 0

    for (const line of lines) {
        let inQuotes = false
        for (const char of line) {
            if (char === '"') {
                inQuotes = !inQuotes
            }
            if (!inQuotes) {
                if (char === ',') commaCount += 1
                if (char === ';') semicolonCount += 1
            }
        }
    }

    return semicolonCount > commaCount ? ';' : ','
}

function parseCsv(content: string, delimiter: ',' | ';'): string[][] {
    const rows: string[][] = []
    let row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < content.length; i += 1) {
        const char = content[i]
        const next = content[i + 1]

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"'
                i += 1
            } else {
                inQuotes = !inQuotes
            }
            continue
        }

        if (!inQuotes && char === delimiter) {
            row.push(current.trim())
            current = ''
            continue
        }

        if (!inQuotes && char === '\n') {
            row.push(current.trim())
            rows.push(row)
            row = []
            current = ''
            continue
        }

        current += char
    }

    if (current.length > 0 || row.length > 0) {
        row.push(current.trim())
        rows.push(row)
    }

    return rows
}

function detectHeaderAndColumns(firstRow: string[]): { hasHeader: boolean; columns: ColumnIndexes } {
    const normalized = firstRow.map(normalizeHeader)
    const columns: ColumnIndexes = {
        dateIndex: findHeaderIndex(normalized, DATE_HEADER_ALIASES),
        descriptionIndex: findHeaderIndex(normalized, DESCRIPTION_HEADER_ALIASES),
        amountIndex: findHeaderIndex(normalized, AMOUNT_HEADER_ALIASES),
        creditIndex: findHeaderIndex(normalized, CREDIT_HEADER_ALIASES),
        debitIndex: findHeaderIndex(normalized, DEBIT_HEADER_ALIASES),
    }

    const hasHeader =
        columns.dateIndex !== null ||
        columns.descriptionIndex !== null ||
        columns.amountIndex !== null ||
        columns.creditIndex !== null ||
        columns.debitIndex !== null

    if (!hasHeader) {
        return {
            hasHeader: false,
            columns: {
                dateIndex: 0,
                descriptionIndex: 1,
                amountIndex: 2,
                creditIndex: null,
                debitIndex: null,
            }
        }
    }

    return { hasHeader: true, columns }
}

function findHeaderIndex(headers: string[], aliases: string[]): number | null {
    const index = headers.findIndex((header) => aliases.includes(header))
    return index >= 0 ? index : null
}

function normalizeHeader(value: string): string {
    return value
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
}

function pickDate(row: string[], columns: ColumnIndexes): string | null {
    const rawDate = row[columns.dateIndex ?? 0]
    if (!rawDate) return null
    return normalizeDate(rawDate)
}

function pickDescription(row: string[], columns: ColumnIndexes): string | null {
    const directDescription = columns.descriptionIndex !== null ? row[columns.descriptionIndex] : null
    if (directDescription && directDescription.trim()) {
        return directDescription.trim()
    }

    for (let i = 0; i < row.length; i += 1) {
        const isDateColumn = i === (columns.dateIndex ?? -1)
        const isAmountColumn = i === (columns.amountIndex ?? -1) || i === (columns.creditIndex ?? -1) || i === (columns.debitIndex ?? -1)

        if (!isDateColumn && !isAmountColumn && row[i].trim()) {
            return row[i].trim()
        }
    }

    return null
}

function pickAmount(row: string[], columns: ColumnIndexes): number | null {
    if (columns.amountIndex !== null) {
        return normalizeAmount(row[columns.amountIndex])
    }

    const credit = columns.creditIndex !== null ? normalizeAmount(row[columns.creditIndex]) : null
    const debit = columns.debitIndex !== null ? normalizeAmount(row[columns.debitIndex]) : null

    if (credit === null && debit === null) {
        return null
    }

    return (credit ?? 0) - (debit ?? 0)
}

function normalizeAmount(raw: string | undefined): number | null {
    if (!raw) return null

    let value = raw.trim().replace(/\s|\u00A0/g, '')
    if (!value) return null

    const isNegative = value.includes('-') || (value.includes('(') && value.includes(')'))

    value = value
        .replace(/^\(/, '')
        .replace(/\)$/, '')
        .replace(/[R$€£¥]/gi, '')
        .replace(/[^0-9.,+-]/g, '')
        .replace(/[+-]/g, '')

    if (!value) return null

    const commaCount = (value.match(/,/g) || []).length
    const dotCount = (value.match(/\./g) || []).length

    if (commaCount > 0 && dotCount > 0) {
        const lastComma = value.lastIndexOf(',')
        const lastDot = value.lastIndexOf('.')
        const decimalSeparator = lastComma > lastDot ? ',' : '.'
        const thousandSeparator = decimalSeparator === ',' ? '.' : ','

        value = value.split(thousandSeparator).join('')
        value = value.replace(decimalSeparator, '.')
    } else if (commaCount > 0) {
        const isDecimal = /,\d{1,2}$/.test(value)
        value = isDecimal ? value.replace(',', '.') : value.replace(/,/g, '')
    } else if (dotCount > 0) {
        const isDecimal = /\.\d{1,2}$/.test(value)
        value = isDecimal ? value : value.replace(/\./g, '')
    }

    const numericValue = Number(value)
    if (Number.isNaN(numericValue)) return null

    return isNegative ? -Math.abs(numericValue) : numericValue
}

function normalizeDate(raw: string): string | null {
    const value = raw.trim()
    if (!value) return null

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value
    }

    const numericParts = value.split(/[^0-9]/).filter(Boolean)

    if (numericParts.length >= 3) {
        let year: number
        let month: number
        let day: number

        if (numericParts[0].length === 4) {
            year = Number(numericParts[0])
            month = Number(numericParts[1])
            day = Number(numericParts[2])
        } else if (numericParts[2].length === 4) {
            day = Number(numericParts[0])
            month = Number(numericParts[1])
            year = Number(numericParts[2])
        } else {
            day = Number(numericParts[0])
            month = Number(numericParts[1])
            year = Number(numericParts[2])
            year = year < 100 ? (year >= 70 ? 1900 + year : 2000 + year) : year
        }

        const parsedDate = createValidDate(year, month, day)
        if (parsedDate) {
            return toLocalDateString(parsedDate)
        }
    }

    const fallbackDate = new Date(value)
    if (!Number.isNaN(fallbackDate.getTime())) {
        return toLocalDateString(fallbackDate)
    }

    return null
}

function createValidDate(year: number, month: number, day: number): Date | null {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null
    if (month < 1 || month > 12 || day < 1 || day > 31) return null

    const date = new Date(year, month - 1, day)
    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
}

function toLocalDateString(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
