import { createServerSupabaseClient } from '@/lib/supabase/server'
import { QuizEngine } from '@/components/estudiante/quiz-engine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, AlertTriangle } from 'lucide-react'

export default async function QuizPage({
  params,
}: {
  params: Promise<{ cursoId: string; unidadId: string; leccionId: string }>
}) {
  const { cursoId, unidadId, leccionId } = await params
  const supabase = await createServerSupabaseClient()

  // Get quiz
  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('lesson_id', leccionId)
    .eq('is_published', true)
    .single()

  if (!quiz) return notFound()

  // Get questions
  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('quiz_id', (quiz as any).id)
    .order('display_order')

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">Quiz sin preguntas</h2>
            <p className="text-muted-foreground mb-4">Este quiz aun no tiene preguntas configuradas</p>
            <Link href={`/cursos/${cursoId}/${unidadId}/${leccionId}`}>
              <Button variant="outline">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Volver a la leccion
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get attempt count
  const { data: { user } } = await supabase.auth.getUser()
  let attemptNumber = 1

  if (user) {
    const { count } = await supabase
      .from('quiz_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', user.id)
      .eq('quiz_id', (quiz as any).id)

    attemptNumber = (count || 0) + 1

    if (attemptNumber > (quiz as any).max_attempts) {
      return (
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h2 className="text-xl font-bold mb-2">Intentos agotados</h2>
              <p className="text-muted-foreground mb-4">
                Has usado los {(quiz as any).max_attempts} intentos permitidos para este quiz
              </p>
              <Link href={`/cursos/${cursoId}`}>
                <Button>Volver al curso</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href={`/cursos/${cursoId}/${unidadId}/${leccionId}`}
          className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver a la leccion
        </Link>
      </div>

      <QuizEngine
        quiz={quiz as any}
        questions={questions as any[]}
        lessonId={leccionId}
        courseId={cursoId}
        unitId={unidadId}
        attemptNumber={attemptNumber}
      />
    </div>
  )
}
