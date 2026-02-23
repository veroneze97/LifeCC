import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'

type TransactionType = 'income' | 'expense'

interface InputRow {
  date: string
  description: string
  amount: number
  type: TransactionType
}

interface RequestBody {
  rows: InputRow[]
  categories: string[]
}

interface OutputRow {
  cleanDescription: string
  category: string
  confidence: number
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

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
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return jsonResponse({ error: 'Missing OPENAI_API_KEY env var' }, 500)
  }

  let payload: RequestBody
  try {
    payload = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }

  const validationError = validatePayload(payload)
  if (validationError) {
    return jsonResponse({ error: validationError }, 400)
  }

  const categories = uniqueCategories(payload.categories)
  const modelRows = payload.rows.map((row, index) => ({
    index,
    date: row.date,
    description: row.description.trim(),
    amount: Number(row.amount),
    type: row.type,
  }))

  try {
    const llmRows = await classifyWithOpenAI({
      apiKey,
      rows: modelRows,
      categories,
    })

    const finalRows = payload.rows.map((inputRow, index) => {
      const llmRow = llmRows[index]
      return sanitizeOutputRow(llmRow, inputRow, categories)
    })

    return jsonResponse({ rows: finalRows }, 200)
  } catch (error) {
    console.error('classify-transactions error:', error)
    return jsonResponse({ error: 'Failed to classify rows' }, 502)
  }
})

function validatePayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return 'Body must be an object'

  const body = payload as Partial<RequestBody>
  if (!Array.isArray(body.rows) || body.rows.length === 0) {
    return '"rows" must be a non-empty array'
  }
  if (!Array.isArray(body.categories) || body.categories.length === 0) {
    return '"categories" must be a non-empty array'
  }

  if (!body.categories.some((c) => normalizeCategory(c) === normalizeCategory('Outros'))) {
    return '"categories" must include "Outros" for low-confidence fallback'
  }

  for (const category of body.categories) {
    if (typeof category !== 'string' || !category.trim()) {
      return 'Every category must be a non-empty string'
    }
  }

  for (const [i, row] of body.rows.entries()) {
    if (!row || typeof row !== 'object') return `Row ${i} is invalid`
    const candidate = row as Partial<InputRow>

    if (typeof candidate.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(candidate.date)) {
      return `Row ${i} has invalid "date" (expected YYYY-MM-DD)`
    }
    if (typeof candidate.description !== 'string' || !candidate.description.trim()) {
      return `Row ${i} has invalid "description"`
    }
    if (typeof candidate.amount !== 'number' || Number.isNaN(candidate.amount)) {
      return `Row ${i} has invalid "amount"`
    }
    if (candidate.type !== 'income' && candidate.type !== 'expense') {
      return `Row ${i} has invalid "type"`
    }
  }

  return null
}

function uniqueCategories(categories: string[]): string[] {
  const unique: string[] = []
  const seen = new Set<string>()
  for (const category of categories) {
    const value = category.trim()
    const key = normalizeCategory(value)
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(value)
    }
  }
  return unique
}

async function classifyWithOpenAI(args: {
  apiKey: string
  rows: Array<{ index: number; date: string; description: string; amount: number; type: TransactionType }>
  categories: string[]
}): Promise<OutputRow[]> {
  const instruction = [
    'You classify financial transactions for Brazilian Portuguese users.',
    'Return strictly valid JSON only.',
    'For each row, clean short description and pick one category from the allowed list.',
    'If uncertain, use category "Outros" and confidence <= 40.',
    'Confidence must be an integer from 0 to 100.',
    'Do not invent categories outside the allowed list.',
  ].join(' ')

  const userPrompt = {
    categories: args.categories,
    rows: args.rows,
    output_format: {
      rows: [
        {
          cleanDescription: 'string',
          category: 'one of categories',
          confidence: 'integer 0..100',
        },
      ],
    },
  }

  const requestBody = {
    model: MODEL,
    temperature: 0.1,
    messages: [
      { role: 'system', content: instruction },
      { role: 'user', content: JSON.stringify(userPrompt) },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'transaction_classification',
        strict: true,
        schema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            rows: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                properties: {
                  cleanDescription: { type: 'string' },
                  category: { type: 'string' },
                  confidence: { type: 'integer', minimum: 0, maximum: 100 },
                },
                required: ['cleanDescription', 'category', 'confidence'],
              },
            },
          },
          required: ['rows'],
        },
      },
    },
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const failureBody = await response.text()
    throw new Error(`OpenAI error ${response.status}: ${failureBody}`)
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string') {
    throw new Error('OpenAI response missing message content')
  }

  const parsed = JSON.parse(content)
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.rows)) {
    throw new Error('OpenAI response JSON does not match expected structure')
  }

  return parsed.rows as OutputRow[]
}

function sanitizeOutputRow(
  row: OutputRow | undefined,
  input: InputRow,
  categories: string[],
): OutputRow {
  const fallbackCategory = findCategory(categories, 'Outros') ?? categories[0]

  const cleanDescription = row?.cleanDescription?.trim()
    ? row.cleanDescription.trim().slice(0, 120)
    : input.description.trim().slice(0, 120)

  const matchedCategory = row?.category ? findCategory(categories, row.category) : null
  const category = matchedCategory ?? fallbackCategory

  const numericConfidence = Number(row?.confidence)
  const confidence = Number.isFinite(numericConfidence)
    ? Math.min(100, Math.max(0, Math.round(numericConfidence)))
    : 15

  if (!matchedCategory) {
    return {
      cleanDescription,
      category: fallbackCategory,
      confidence: Math.min(confidence, 25),
    }
  }

  return {
    cleanDescription,
    category,
    confidence,
  }
}

function findCategory(categories: string[], target: string): string | null {
  const normalizedTarget = normalizeCategory(target)
  for (const category of categories) {
    if (normalizeCategory(category) === normalizedTarget) return category
  }
  return null
}

function normalizeCategory(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
