'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { scheduleReview } from '@/lib/spaced-repetition/scheduler'
import type { ReviewCard, ReviewRating } from '@/lib/spaced-repetition/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, RotateCcw, Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuestionData {
  id: string
  question_text: string
  question_type: string
  options: { id: string; text: string }[]
  correct_answer: string
  feedback_correct: string
  feedback_incorrect: string
}

type SessionPhase = 'answering' | 'feedback' | 'done'

export function ReviewSession() {
  const [cards, setCards] = useState<ReviewCard[]>([])
  const [questions, setQuestions] = useState<Map<string, QuestionData>>(new Map())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [phase, setPhase] = useState<SessionPhase>('answering')
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ reviewed: 0, correct: 0 })

  const supabase = createClient()

  useEffect(() => {
    async function loadDueCards() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const now = new Date().toISOString()

        const { data: cardData, error: cardError } = await supabase
          .from('review_cards')
          .select('*')
          .eq('student_id', user.id)
          .lte('due_at', now)
          .order('due_at', { ascending: true })

        if (cardError) throw cardError
        if (!cardData || cardData.length === 0) {
          setLoading(false)
          return
        }

        const typedCards = cardData as ReviewCard[]
        setCards(typedCards)

        // Fetch questions for all cards
        const questionIds = typedCards.map((c) => c.question_id)
        const { data: questionData, error: qError } = await supabase
          .from('questions')
          .select('id, question_text, question_type, options, correct_answer, feedback_correct, feedback_incorrect')
          .in('id', questionIds)

        if (qError) throw qError

        const qMap = new Map<string, QuestionData>()
        ;(questionData as QuestionData[])?.forEach((q) => qMap.set(q.id, q))
        setQuestions(qMap)
      } catch (err) {
        console.error('Error loading review cards:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDueCards()
  }, [])

  const currentCard = cards[currentIndex]
  const currentQuestion = currentCard
    ? questions.get(currentCard.question_id)
    : null
  const totalCards = cards.length
  const progressPercent =
    totalCards > 0 ? (stats.reviewed / totalCards) * 100 : 0

  const handleAnswer = useCallback(
    (answerId: string) => {
      if (phase !== 'answering' || !currentQuestion) return

      setSelectedAnswer(answerId)
      const correct = answerId === currentQuestion.correct_answer
      setIsCorrect(correct)
      setPhase('feedback')
      setStats((prev) => ({
        reviewed: prev.reviewed + 1,
        correct: prev.correct + (correct ? 1 : 0),
      }))
    },
    [phase, currentQuestion]
  )

  const handleRating = useCallback(
    async (rating: ReviewRating) => {
      if (!currentCard) return

      const result = scheduleReview(currentCard, rating)

      // Update card in Supabase
      await supabase
        .from('review_cards')
        .update({
          state: result.card.state,
          stability: result.card.stability,
          difficulty: result.card.difficulty,
          due_at: result.card.due_at,
          last_review_at: result.card.last_review_at,
          reps: result.card.reps,
          lapses: result.card.lapses,
        })
        .eq('id', currentCard.id)

      // Save review log
      await supabase.from('review_logs').insert({
        id: result.log.id,
        card_id: result.log.card_id,
        rating: result.log.rating,
        state: result.log.state,
        scheduled_days: result.log.scheduled_days,
        elapsed_days: result.log.elapsed_days,
        review_at: result.log.review_at,
        stability: result.log.stability,
        difficulty: result.log.difficulty,
      })

      // Move to next card or done
      if (currentIndex + 1 >= totalCards) {
        setPhase('done')
      } else {
        setCurrentIndex((prev) => prev + 1)
        setSelectedAnswer(null)
        setPhase('answering')
      }
    },
    [currentCard, currentIndex, totalCards, supabase]
  )

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2 text-muted-foreground">
            <RotateCcw className="h-5 w-5 animate-spin" />
            <span>Cargando tarjetas de repaso...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">
              ¡No tienes repasos pendientes!
            </p>
            <p className="text-sm">
              Vuelve mas tarde o completa mas quizzes para generar tarjetas.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Session complete
  if (phase === 'done') {
    const accuracy =
      stats.reviewed > 0
        ? Math.round((stats.correct / stats.reviewed) * 100)
        : 0

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Sesion Completada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-2">
              {accuracy >= 80 ? '🎉' : accuracy >= 50 ? '👍' : '💪'}
            </div>
            <p className="text-lg font-semibold">
              {accuracy >= 80
                ? '¡Excelente trabajo!'
                : accuracy >= 50
                  ? '¡Buen esfuerzo!'
                  : '¡Sigue practicando!'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{stats.reviewed}</p>
              <p className="text-sm text-muted-foreground">
                Tarjetas revisadas
              </p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-sm text-muted-foreground">Precision</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!currentQuestion) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No se encontro la pregunta para esta tarjeta.
        </CardContent>
      </Card>
    )
  }

  const options = Array.isArray(currentQuestion.options)
    ? currentQuestion.options
    : []

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Tarjeta {currentIndex + 1} de {totalCards}
          </span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Repaso
            </Badge>
            <span className="text-xs text-muted-foreground">
              {stats.correct}/{stats.reviewed} correctas
            </span>
          </div>
          <CardTitle className="text-lg mt-2">
            {currentQuestion.question_text}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Options */}
          {options.map((option) => {
            const isSelected = selectedAnswer === option.id
            const isCorrectOption =
              option.id === currentQuestion.correct_answer
            const showResult = phase === 'feedback'

            return (
              <button
                key={option.id}
                onClick={() => handleAnswer(option.id)}
                disabled={phase !== 'answering'}
                className={cn(
                  'w-full text-left p-3 rounded-lg border transition-all duration-200',
                  'hover:bg-muted/50 disabled:cursor-default',
                  phase === 'answering' && 'hover:border-primary/50',
                  showResult && isCorrectOption && 'border-green-500 bg-green-50',
                  showResult && isSelected && !isCorrectOption && 'border-red-500 bg-red-50',
                  !showResult && isSelected && 'border-primary bg-primary/5'
                )}
              >
                <div className="flex items-center gap-2">
                  {showResult && isCorrectOption && (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  )}
                  {showResult && isSelected && !isCorrectOption && (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  <span className="text-sm">{option.text}</span>
                </div>
              </button>
            )
          })}

          {/* Feedback */}
          {phase === 'feedback' && (
            <div
              className={cn(
                'mt-4 p-3 rounded-lg text-sm',
                isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              )}
            >
              {isCorrect
                ? currentQuestion.feedback_correct
                : currentQuestion.feedback_incorrect}
            </div>
          )}

          {/* Rating Buttons */}
          {phase === 'feedback' && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
                onClick={() => handleRating('again')}
              >
                Otra vez
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-orange-200 text-orange-700 hover:bg-orange-50"
                onClick={() => handleRating('hard')}
              >
                Dificil
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                onClick={() => handleRating('good')}
              >
                Bien
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => handleRating('easy')}
              >
                Facil
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
