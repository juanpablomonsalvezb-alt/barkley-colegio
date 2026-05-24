/**
 * Generador de contenido v2: dual-model (Sonnet/Haiku) + prompt caching + libro context.
 * Diseñado para corridas CLI/batch, no para invocación desde route handlers.
 */
import Anthropic from '@anthropic-ai/sdk'
import type { ContentType } from './types'
import {
  getLessonPrompt,
  getQuizPrompt,
  getReinforcementPrompt,
  getChallengePrompt,
} from './prompts'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/** Modelos vigentes 2026. Configurables vía env si Anthropic libera nuevos. */
const MODEL_SONNET = process.env.ANTHROPIC_MODEL_SONNET ?? 'claude-sonnet-4-5-20250929'
const MODEL_HAIKU = process.env.ANTHROPIC_MODEL_HAIKU ?? 'claude-haiku-4-5-20251015'

/** Asignación modelo por tipo de contenido */
export const MODEL_MAP: Record<ContentType, string> = {
  lesson: MODEL_SONNET,
  quiz: MODEL_HAIKU,
  reinforcement: MODEL_HAIKU,
  challenge: MODEL_SONNET,
  adaptive_rules: MODEL_HAIKU,
}

/** max_tokens output sugerido por tipo */
const MAX_OUTPUT: Record<ContentType, number> = {
  lesson: 8000,
  quiz: 12000,
  reinforcement: 6000,
  challenge: 5000,
  adaptive_rules: 1500,
}

export interface OAInput {
  grade_label: string // "4° Básico"
  grade_age: number // 9
  subject_name: string // "Matemática"
  eje: string
  oa_code: string
  oa_number: number
  oa_description: string
  indicadores: string[]
}

export interface GenerateOptions {
  /** Libro completo en MD (será cacheado). Si null, sin libro como contexto. */
  bookMd: string | null
  /** Override de modelo (opcional) */
  modelOverride?: string
  /** Imprime logs de progreso */
  verbose?: boolean
}

export interface GenerationResult {
  type: ContentType
  oa_code: string
  model: string
  output: unknown
  usage: {
    input_tokens: number
    output_tokens: number
    cache_creation_input_tokens: number
    cache_read_input_tokens: number
  }
  cost_usd: number
  duration_ms: number
}

/** Pricing por MTok (USD) — 2026 */
const PRICING = {
  [MODEL_SONNET]: { input: 3, output: 15, cache_write: 3.75, cache_read: 0.3 },
  [MODEL_HAIKU]: { input: 1, output: 5, cache_write: 1.25, cache_read: 0.1 },
} as const

function calcCost(model: string, usage: GenerationResult['usage']): number {
  const p = PRICING[model as keyof typeof PRICING]
  if (!p) return 0
  return (
    (usage.input_tokens * p.input +
      usage.output_tokens * p.output +
      usage.cache_creation_input_tokens * p.cache_write +
      usage.cache_read_input_tokens * p.cache_read) /
    1_000_000
  )
}

function buildPromptForType(type: ContentType, oa: OAInput): string {
  // Mapeo OAInput → GenerationParams (formato esperado por prompts.ts)
  const params = {
    subject: oa.subject_name,
    gradeLevel: '4_basico', // TODO: derivar de oa.grade_label
    topic: oa.eje,
    learningObjectives: [oa.oa_description, ...oa.indicadores],
    difficulty: 2 as const,
    style: 'cercano, motivador, con contexto chileno',
    curriculumCode: oa.oa_code,
  }

  switch (type) {
    case 'lesson':
      return getLessonPrompt(params)
    case 'quiz':
      return getQuizPrompt(params)
    case 'reinforcement':
      return getReinforcementPrompt(params)
    case 'challenge':
      return getChallengePrompt(params)
    default:
      throw new Error(`Tipo no soportado: ${type}`)
  }
}

function extractJson(text: string): unknown {
  // Remueve markdown fences si IA las puso
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error(`JSON inválido en respuesta IA: ${cleaned.slice(0, 200)}...`)
  }
}

/**
 * Genera UNA pieza de contenido (lesson | quiz | reinforcement | challenge) para UN OA.
 * Usa cache_control sobre el libro para reducir costo en llamadas subsiguientes
 * de la misma asignatura/grado dentro de la ventana de 5 min.
 */
export async function generatePiece(
  type: ContentType,
  oa: OAInput,
  opts: GenerateOptions
): Promise<GenerationResult> {
  const model = opts.modelOverride ?? MODEL_MAP[type]
  const start = Date.now()

  // System prompt con libro escolar como bloque CACHEABLE
  const systemBlocks: Anthropic.Messages.TextBlockParam[] = []
  if (opts.bookMd) {
    systemBlocks.push({
      type: 'text',
      text: `Material de referencia: libro escolar oficial chileno para ${oa.subject_name} ${oa.grade_label}.

${opts.bookMd}

Usa este libro como fuente de metodología, ejemplos y vocabulario. NO inventes contenido curricular fuera de él.`,
      cache_control: { type: 'ephemeral' },
    })
  }
  systemBlocks.push({
    type: 'text',
    text: 'Eres profesor virtual de Barkley, plataforma chilena de preparación para Exámenes Libres MINEDUC. Responde SIEMPRE solo con JSON válido, sin markdown fences, sin texto adicional.',
  })

  const userPrompt = buildPromptForType(type, oa)

  if (opts.verbose) {
    console.log(`  [${type}] ${model} → ${oa.oa_code} ...`)
  }

  const response = await client.messages.create({
    model,
    max_tokens: MAX_OUTPUT[type],
    system: systemBlocks,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')

  const output = extractJson(text)

  const usage = {
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    cache_creation_input_tokens: response.usage.cache_creation_input_tokens ?? 0,
    cache_read_input_tokens: response.usage.cache_read_input_tokens ?? 0,
  }

  const cost = calcCost(model, usage)
  const duration = Date.now() - start

  if (opts.verbose) {
    console.log(
      `    ✓ in:${usage.input_tokens} out:${usage.output_tokens} cache_w:${usage.cache_creation_input_tokens} cache_r:${usage.cache_read_input_tokens} cost:$${cost.toFixed(4)} (${duration}ms)`
    )
  }

  return {
    type,
    oa_code: oa.oa_code,
    model,
    output,
    usage,
    cost_usd: cost,
    duration_ms: duration,
  }
}

/**
 * Genera las 4 piezas (lesson, quiz, reinforcement, challenge) para 1 OA.
 * El libro se cachea entre llamadas → 2da+ llamada usa cache_read.
 */
export async function generateFullOA(
  oa: OAInput,
  opts: GenerateOptions
): Promise<GenerationResult[]> {
  const types: ContentType[] = ['lesson', 'quiz', 'reinforcement', 'challenge']
  const results: GenerationResult[] = []
  for (const t of types) {
    const r = await generatePiece(t, oa, opts)
    results.push(r)
  }
  return results
}
