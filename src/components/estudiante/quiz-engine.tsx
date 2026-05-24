'use client'

import { useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useQuizStore } from '@/stores/quiz-store'
import { QuizQuestion } from './quiz-question'
import { QuizResults } from './quiz-results'
import { checkAnswer, getFeedback, prepareQuestions } from '@/lib/quiz/engine'
import { calculateScore } from '@/lib/quiz/scorer'
import { getAdaptiveAction } from '@/lib/quiz/adaptive-router'
import { formatDuration } from '@/lib/formatters'
import { Clock, AlertTriangle } from 'lucide-react'
import type { Question, Quiz } from '@/lib/quiz/types'

interface QuizEngineProps {
  quiz: Quiz
  questions: Question[]
  lessonId: string
  courseId: string
  unitId: string
  attemptNumber: number
  onComplete?: (result: any) => void
}

export function QuizEngine({
  quiz,
  questions,
  lessonId,
  courseId,
  unitId,
  attemptNumber,
  onComplete,
}: QuizEngineProps) {
  const store = useQuizStore()

  // Initialize quiz
  useEffect(() => {
    const prepared = prepareQuestions(questions, quiz.shuffle_questions, quiz.shuffle_options)
    store.initQuiz(prepared, quiz.time_limit_seconds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Timer
  useEffect(() => {
    if (store.timeRemaining === null || store.timeRemaining <= 0 || store.isCompleted) return

    const interval = setInterval(() => {
      store.setTimeRemaining(store.timeRemaining! - 1)

      if (store.timeRemaining! <= 1) {
        handleFinishQuiz()
      }
    }, 1000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.timeRemaining, store.isCompleted])

  const handleAnswerSubmit = useCallback((answer: any) => {
    const question = store.questions[store.currentIndex]
    if (!question) return

    const timeSeconds = Math.round((Date.now() - store.questionStartTime) / 1000)
    store.submitAnswer(answer, timeSeconds)

    const isCorrect = checkAnswer(question, answer)
    const feedback = getFeedback(question, answer, isCorrect)

    if (quiz.show_correct_after) {
      store.showAnswerFeedback(feedback, isCorrect)
    } else {
      // Auto-advance without feedback
      if (store.currentIndex < store.questions.length - 1) {
        store.nextQuestion()
      } else {
        handleFinishQuiz()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentIndex, store.questions, store.questionStartTime])

  const handleNextQuestion = useCallback(() => {
    if (store.currentIndex < store.questions.length - 1) {
      store.nextQuestion()
    } else {
      handleFinishQuiz()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentIndex, store.questions.length])

  const handleFinishQuiz = useCallback(() => {
    const result = calculateScore(store.questions, store.answers)
    const adaptiveAction = getAdaptiveAction(result.assigned_path)

    store.completeQuiz({
      scoreEarned: result.score_earned,
      scoreTotal: result.score_total,
      scorePercent: result.score_percent,
      assignedPath: result.assigned_path,
      adaptiveAction,
      answers: result.answers,
    })

    onComplete?.({
      ...result,
      adaptiveAction,
      attemptNumber,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.questions, store.answers, attemptNumber])

  // Show results
  if (store.isCompleted && store.adaptiveAction) {
    return (
      <QuizResults
        scoreEarned={store.scoreEarned}
        scoreTotal={store.scoreTotal}
        scorePercent={store.scorePercent}
        adaptiveAction={store.adaptiveAction}
        answers={store.questionResults}
        questions={store.questions}
        courseId={courseId}
        unitId={unitId}
        lessonId={lessonId}
      />
    )
  }

  if (store.questions.length === 0) return null

  const currentQuestion = store.questions[store.currentIndex]
  const progressPercent = ((store.currentIndex) / store.questions.length) * 100

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-bold text-lg">{quiz.title}</h1>
            <div className="flex items-center gap-3">
              {store.timeRemaining !== null && (
                <Badge
                  variant={store.timeRemaining < 60 ? 'destructive' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <Clock className="h-3 w-3" />
                  {formatDuration(store.timeRemaining)}
                </Badge>
              )}
              <Badge variant="outline">
                Intento {attemptNumber} de {quiz.max_attempts}
              </Badge>
            </div>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardContent className="py-6">
          <QuizQuestion
            question={currentQuestion}
            questionNumber={store.currentIndex + 1}
            totalQuestions={store.questions.length}
            showFeedback={store.showFeedback}
            feedback={store.currentFeedback}
            isCorrect={store.currentIsCorrect}
            onSubmit={handleAnswerSubmit}
          />

          {/* Next / Finish button (shown after feedback) */}
          {store.showFeedback && (
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="w-full mt-6"
            >
              {store.currentIndex < store.questions.length - 1
                ? 'Siguiente Pregunta'
                : 'Ver Resultados'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
