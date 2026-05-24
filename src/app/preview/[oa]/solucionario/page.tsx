/**
 * Solucionario standalone — ejercicios + respuestas + explicaciones.
 * URL: /preview/MA04-OA01/solucionario
 */
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import WorksheetView from '../worksheet-view'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ oa: string }>
}

export default async function SolucionarioPage({ params }: PageProps) {
  const { oa: oaCode } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`id, title, unit_id, units(title, courses(grade_level, subjects(name)))`)
    .ilike('slug', `${oaCode.toLowerCase()}%`)
    .limit(1)
    .maybeSingle()

  if (!lesson) notFound()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id')
    .eq('lesson_id', lesson.id)
    .maybeSingle()

  let questions: any[] = []
  if (quiz?.id) {
    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('display_order', { ascending: true })
    questions = qs ?? []
  }

  const unit = (lesson as any).units
  const course = unit?.courses
  const subject = course?.subjects

  return (
    <WorksheetView
      mode="solucionario"
      questions={questions}
      unitTitle={unit?.title ?? lesson.title}
      oaCode={oaCode.toUpperCase()}
      gradeLabel={course?.grade_level === '4_basico' ? '4° Básico' : (course?.grade_level ?? '')}
      subjectName={subject?.name ?? ''}
    />
  )
}
