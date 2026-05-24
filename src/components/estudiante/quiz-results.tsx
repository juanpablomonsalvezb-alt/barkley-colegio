'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { ADAPTIVE_PATHS } from '@/lib/constants'
import { formatPercent } from '@/lib/formatters'
import { Trophy, ArrowRight, RotateCcw, CheckCircle2, XCircle, Star } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { AdaptiveAction } from '@/lib/quiz/types'

interface QuestionAnswer {
  is_correct: boolean
}

interface QuizResultsProps {
  scoreEarned: number
  scoreTotal: number
  scorePercent: number
  adaptiveAction: AdaptiveAction
  answers: QuestionAnswer[]
  questions: any[]
  courseId: string
  unitId: string
  lessonId: string
}

export function QuizResults({
  scoreEarned,
  scoreTotal,
  scorePercent,
  adaptiveAction,
  answers,
  questions,
  courseId,
  unitId,
  lessonId,
}: QuizResultsProps) {
  const pathConfig = ADAPTIVE_PATHS[adaptiveAction.path]
  const correctCount = answers.filter(a => a.is_correct).length
  const incorrectCount = answers.filter(a => !a.is_correct).length

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Score Card */}
      <Card className={cn('border-2', pathConfig?.border)}>
        <CardContent className="py-8 text-center">
          <div className="mb-4">
            {scorePercent >= 85 ? (
              <Star className="h-16 w-16 mx-auto text-yellow-500 fill-yellow-500" />
            ) : scorePercent >= 60 ? (
              <Trophy className="h-16 w-16 mx-auto text-blue-500" />
            ) : (
              <RotateCcw className="h-16 w-16 mx-auto text-orange-500" />
            )}
          </div>

          <h2 className="text-4xl font-bold mb-2">{formatPercent(scorePercent)}</h2>
          <p className="text-muted-foreground mb-4">
            {scoreEarned} de {scoreTotal} puntos
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">{correctCount} correctas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">{incorrectCount} incorrectas</span>
            </div>
          </div>

          <Progress value={scorePercent} className="h-3 max-w-xs mx-auto" />
        </CardContent>
      </Card>

      {/* Adaptive Path Message */}
      <Card className={cn('border-2', pathConfig?.border, pathConfig?.bg)}>
        <CardContent className="py-6">
          <div className="text-center">
            <Badge className={cn('mb-3', pathConfig?.bg, pathConfig?.color, 'border', pathConfig?.border)}>
              Ruta: {pathConfig?.label}
            </Badge>
            <h3 className="text-xl font-bold mb-2">{adaptiveAction.message_title}</h3>
            <p className="text-muted-foreground">{adaptiveAction.message_body}</p>
          </div>
        </CardContent>
      </Card>

      {/* Answer Review */}
      <Card>
        <CardHeader>
          <CardTitle>Revision de Respuestas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question, idx) => {
            const answer = answers[idx]
            return (
              <div key={question.id} className="flex items-start gap-3 py-3 border-b last:border-0">
                <div className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  answer?.is_correct ? 'bg-green-100' : 'bg-red-100'
                )}>
                  {answer?.is_correct ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{question.question_text}</p>
                  <p className={cn(
                    'text-xs mt-1',
                    answer?.is_correct ? 'text-green-600' : 'text-red-600'
                  )}>
                    {answer?.is_correct ? question.feedback_correct : question.feedback_incorrect}
                  </p>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        {adaptiveAction.show_reinforcement && (
          <Link href={`/cursos/${courseId}/${unitId}/${lessonId}?mode=refuerzo`} className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              Ver Material de Refuerzo
            </Button>
          </Link>
        )}
        {adaptiveAction.show_challenge && (
          <Link href={`/cursos/${courseId}/${unitId}/${lessonId}?mode=desafio`} className="flex-1">
            <Button variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50" size="lg">
              Ir al Desafio
            </Button>
          </Link>
        )}
        <Link href={`/cursos/${courseId}`} className="flex-1">
          <Button className="w-full" size="lg">
            Continuar
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
