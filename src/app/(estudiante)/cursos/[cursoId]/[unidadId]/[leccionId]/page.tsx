import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LessonViewer } from '@/components/estudiante/lesson-viewer'
import { Badge } from '@/components/ui/badge'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function LeccionPage({
  params,
  searchParams,
}: {
  params: Promise<{ cursoId: string; unidadId: string; leccionId: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { cursoId, unidadId, leccionId } = await params
  const { mode } = await searchParams
  const supabase = await createServerSupabaseClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', leccionId)
    .single()

  if (!lesson) return notFound()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', leccionId)
    .eq('is_published', true)
    .single()

  // If mode=refuerzo, show reinforcement content
  const displayLesson = mode === 'refuerzo' ? {
    ...(lesson as any),
    content_html: (lesson as any).reinforcement_content_html || (lesson as any).content_html,
    video_url: (lesson as any).reinforcement_video_url || (lesson as any).video_url,
  } : mode === 'desafio' ? {
    ...(lesson as any),
    content_html: (lesson as any).challenge_content_html || (lesson as any).content_html,
  } : lesson

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/cursos/${cursoId}`} className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Volver al curso
        </Link>
        {mode && (
          <Badge variant="secondary" className="ml-2">
            {mode === 'refuerzo' ? 'Material de Refuerzo' : 'Contenido Desafio'}
          </Badge>
        )}
      </div>

      <h1 className="text-3xl font-bold">{(lesson as any).title}</h1>

      <LessonViewer
        lesson={displayLesson as any}
        quizId={(quiz as any)?.id || null}
        courseId={cursoId}
        unitId={unidadId}
      />
    </div>
  )
}
