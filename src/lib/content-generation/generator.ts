import { createAdminClient } from '@/lib/supabase/admin'
import type { ContentType, GenerationParams } from './types'
import {
  getLessonPrompt,
  getQuizPrompt,
  getReinforcementPrompt,
  getChallengePrompt,
  getAdaptiveRulesPrompt,
} from './prompts'

const MODEL = 'claude-sonnet-4-20250514'
const API_URL = 'https://api.anthropic.com/v1/messages'

function getPrompt(type: ContentType, params: GenerationParams): string {
  switch (type) {
    case 'lesson':
      return getLessonPrompt(params)
    case 'quiz':
      return getQuizPrompt(params)
    case 'reinforcement':
      return getReinforcementPrompt(params)
    case 'challenge':
      return getChallengePrompt(params)
    case 'adaptive_rules':
      return getAdaptiveRulesPrompt(params)
  }
}

function extractJson(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // Try to find JSON block in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    throw new Error('No se encontró JSON válido en la respuesta del modelo.')
  }
}

export async function generateContent(
  type: ContentType,
  params: GenerationParams,
  jobId: string
): Promise<unknown> {
  const supabase = createAdminClient()
  const startTime = Date.now()

  // Mark job as generating
  await supabase
    .from('content_generation_jobs')
    .update({ status: 'generando', updated_at: new Date().toISOString() })
    .eq('id', jobId)

  try {
    const prompt = getPrompt(type, params)

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(120_000),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`API error ${response.status}: ${errorBody}`)
    }

    const data = await response.json()
    const generationTimeMs = Date.now() - startTime

    // Extract text content
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text'
    )
    if (!textBlock?.text) {
      throw new Error('La respuesta del modelo no contiene texto.')
    }

    const parsed = extractJson(textBlock.text)

    // Calculate tokens
    const tokensUsed =
      (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0)

    // Update job with results
    await supabase
      .from('content_generation_jobs')
      .update({
        status: 'revision',
        output_content: parsed as Record<string, unknown>,
        model_used: MODEL,
        tokens_used: tokensUsed,
        generation_time_ms: generationTimeMs,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return parsed
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Error desconocido'

    await supabase
      .from('content_generation_jobs')
      .update({
        status: 'rechazado',
        error_message: errorMessage,
        generation_time_ms: Date.now() - startTime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    throw error
  }
}
