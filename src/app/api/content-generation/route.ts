import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateContent } from '@/lib/content-generation/generator'
import type { ContentType, GenerationParams } from '@/lib/content-generation/types'

const VALID_TYPES: ContentType[] = [
  'lesson',
  'quiz',
  'reinforcement',
  'challenge',
  'adaptive_rules',
]

export async function POST(request: NextRequest) {
  try {
    // Verify auth + admin role
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado.' },
        { status: 401 }
      )
    }

    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso restringido a administradores.' },
        { status: 403 }
      )
    }

    // Parse body
    const body = await request.json()
    const {
      type,
      params,
      targetLessonId,
      targetCourseId,
    } = body as {
      type: ContentType
      params: GenerationParams
      targetLessonId?: string
      targetCourseId?: string
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Tipo inválido: ${type}` },
        { status: 400 }
      )
    }

    if (!params?.subject || !params?.gradeLevel || !params?.topic) {
      return NextResponse.json(
        { error: 'Faltan parámetros obligatorios: subject, gradeLevel, topic.' },
        { status: 400 }
      )
    }

    // Create job record
    const { data: job, error: jobError } = await adminClient
      .from('content_generation_jobs')
      .insert({
        target_type: type,
        input_params: params as unknown as Record<string, unknown>,
        status: 'pendiente',
        requested_by: user.id,
        target_lesson_id: targetLessonId ?? null,
        target_course_id: targetCourseId ?? null,
      })
      .select('id')
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { error: 'Error al crear el trabajo de generación.' },
        { status: 500 }
      )
    }

    // Run generation (up to 120s)
    const result = await generateContent(type, params, job.id)

    return NextResponse.json({
      jobId: job.id,
      status: 'revision',
      content: result,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Error interno del servidor.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
