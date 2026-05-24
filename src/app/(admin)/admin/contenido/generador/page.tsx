import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ContentGenerator } from '@/components/admin/content-generator'
import type { GenerationJob } from '@/lib/content-generation/types'

export const metadata = {
  title: 'Generador de Contenido IA - Barkley Admin',
}

export default async function GeneradorPage() {
  // Auth + role check
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  // Fetch subjects
  const { data: subjects } = await adminClient
    .from('subjects')
    .select('id, name, slug')
    .order('display_order', { ascending: true })

  // Fetch recent generation jobs (last 20)
  const { data: recentJobsRaw } = await adminClient
    .from('content_generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const recentJobs: GenerationJob[] = (recentJobsRaw ?? []).map((j) => ({
    id: j.id,
    target_type: j.target_type,
    input_params: j.input_params as GenerationJob['input_params'],
    output_content: j.output_content,
    status: j.status,
    requested_by: j.requested_by,
    reviewed_by: j.reviewed_by,
    reviewed_at: j.reviewed_at,
    review_notes: j.review_notes,
    model_used: j.model_used,
    tokens_used: j.tokens_used,
    generation_time_ms: j.generation_time_ms,
    error_message: j.error_message,
    target_lesson_id: j.target_lesson_id,
    target_course_id: j.target_course_id,
    created_at: j.created_at,
    updated_at: j.updated_at,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Generador de Contenido IA
        </h1>
        <p className="text-muted-foreground mt-1">
          Crea lecciones, quizzes, material de refuerzo y desafios con
          inteligencia artificial alineada al curriculo chileno.
        </p>
      </div>

      <ContentGenerator
        subjects={subjects ?? []}
        recentJobs={recentJobs}
      />
    </div>
  )
}
