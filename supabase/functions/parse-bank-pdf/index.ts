import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import pdfParse from 'npm:pdf-parse@1.1.1'

interface ParsePdfBody {
  fileBase64?: string
}

interface ParsedRow {
  date: string
  description: string
  amount: number
}

type BankPattern = 'nubank' | 'itau' | 'generic'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed', rows: [] }, 405)
  }

  try {
    const body = (await req.json()) as ParsePdfBody
    const fileBase64 = body?.fileBase64

    if (!fileBase64 || typeof fileBase64 !== 'string') {
      return jsonResponse({ error: 'Missing fileBase64', rows: [] }, 400)
    }

    const binary = decodeBase64Payload(fileBase64)
    if (!binary) {
      return jsonResponse({ error: 'Invalid base64 payload', rows: [] }, 400)
    }

    let rawText = ''
    try {
      const result = await pdfParse(binary)
      rawText = typeof result?.text === 'string' ? result.text : ''
    } catch (pdfError) {
      console.error('parse-bank-pdf: failed to extract text from PDF', pdfError)
      return jsonResponse({
        rows: [],
        bankPattern: 'generic',
        warning: 'Nao foi possivel extrair texto do PDF.',
      }, 200)
    }

    if (!rawText.trim()) {
      return jsonResponse({
        rows: [],
        bankPattern: 'generic',
        warning: 'PDF sem texto legivel.',
      }, 200)
    }

    const bankPattern = detectBankPattern(rawText)
    const rows = parseTransactions(rawText, bankPattern)

    return jsonResponse({
      rows,
      bankPattern,
    }, 200)
  } catch (error) {
    console.error('parse-bank-pdf: unexpected error', error)
    return jsonResponse({
      rows: [],
      bankPattern: 'generic',
      warning: 'Falha ao processar PDF.',
    }, 200)
  }
})

function decodeBase64Payload(payload: string): Uint8Array | null {
  const base64 = payload.includes('base64,') ? payload.split('base64,')[1] : payload
  if (!base64) return null

  try {
    const cleaned = base64.replace(/\s/g, '')
    const binary = atob(cleaned)
    const bytes = new Uint8Array(binary.length)

    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }

    return bytes
  } catch {
    return null
  }
}

function detectBankPattern(text: string): BankPattern {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (
    normalized.includes('nubank') ||
    normalized.includes('nu pagamentos') ||
    normalized.includes('roxinho')
  ) {
    return 'nubank'
  }

  if (
    normalized.includes('itau') ||
    normalized.includes('itau unibanco') ||
    normalized.includes('agencia') && normalized.includes('conta')
  ) {
    return 'itau'
  }

  return 'generic'
}

function parseTransactions(text: string, bankPattern: BankPattern): ParsedRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const rows: ParsedRow[] = []
  const dedupe = new Set<string>()

  for (const line of lines) {
    const parsed = parseTransactionLine(line, bankPattern)
    if (!parsed) continue

    const dedupeKey = `${parsed.date}|${parsed.amount.toFixed(2)}|${normalizeDescription(parsed.description)}`
    if (dedupe.has(dedupeKey)) continue
    dedupe.add(dedupeKey)

    rows.push(parsed)
  }

  return rows
}

function parseTransactionLine(line: string, bankPattern: BankPattern): ParsedRow | null {
  const dateMatch = line.match(/\b(\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4}|\d{4}-\d{2}-\d{2})\b/)
  if (!dateMatch || dateMatch.index === undefined) return null

  const date = normalizeDate(dateMatch[1])
  if (!date) return null

  const amountCandidates = findAmountCandidates(line)
    .filter((candidate) => candidate.index > dateMatch.index)
  if (amountCandidates.length === 0) return null

  const selectedAmount = selectAmountCandidate(amountCandidates, bankPattern)
  const amountText = selectedAmount.value
  const amount = normalizeAmount(amountText, line)
  if (amount === null) return null

  const descriptionRaw = line
    .slice(dateMatch.index + dateMatch[1].length, selectedAmount.index)
    .replace(/^\s*[-–—:|]+\s*/g, '')
    .replace(/\s*[-–—:|]+\s*$/g, '')
    .trim()

  if (!descriptionRaw) return null

  return {
    date,
    description: descriptionRaw.slice(0, 180),
    amount,
  }
}

function findAmountCandidates(line: string): Array<{ value: string; index: number }> {
  const candidates: Array<{ value: string; index: number }> = []
  const regex = /-?\d{1,3}(?:\.\d{3})*,\d{2}|-?\d+(?:\.\d{2})/g

  for (const match of line.matchAll(regex)) {
    if (!match[0] || match.index === undefined) continue
    candidates.push({ value: match[0], index: match.index })
  }

  return candidates
}

function selectAmountCandidate(
  candidates: Array<{ value: string; index: number }>,
  bankPattern: BankPattern,
): { value: string; index: number } {
  if (bankPattern === 'itau') {
    return candidates[0]
  }

  if (bankPattern === 'nubank') {
    return candidates[candidates.length - 1]
  }

  return candidates[candidates.length - 1]
}

function normalizeDate(raw: string): string | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw) || /^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [day, month, year] = raw.split(/[/-]/).map(Number)
    if (!isValidDateParts(year, month, day)) return null
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  return null
}

function isValidDateParts(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return false
  if (month < 1 || month > 12 || day < 1 || day > 31) return false

  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

function normalizeAmount(rawAmount: string, line: string): number | null {
  const trimmed = rawAmount.trim()
  if (!trimmed) return null

  const hasComma = trimmed.includes(',')
  const hasDot = trimmed.includes('.')
  let normalized = trimmed.replace(/[^\d,.-]/g, '')

  if (hasComma && hasDot) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else if (hasComma) {
    normalized = normalized.replace(/\./g, '').replace(',', '.')
  } else {
    const dotCount = (normalized.match(/\./g) || []).length
    if (dotCount > 1) normalized = normalized.replace(/\./g, '')
  }

  const numeric = Number(normalized)
  if (Number.isNaN(numeric)) return null

  if (trimmed.startsWith('-')) return -Math.abs(numeric)

  const lowerLine = line
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  const incomeHints = ['credito', 'recebido', 'entrada', 'deposito', 'pix recebido', 'transferencia recebida']
  const expenseHints = ['debito', 'compra', 'pagamento', 'saque', 'tarifa', 'pix enviado']

  if (incomeHints.some((hint) => lowerLine.includes(hint))) return Math.abs(numeric)
  if (expenseHints.some((hint) => lowerLine.includes(hint))) return -Math.abs(numeric)

  // Conservative default: treat ambiguous amount as expense.
  return -Math.abs(numeric)
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}
