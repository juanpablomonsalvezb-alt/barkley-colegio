'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import type { Question } from '@/lib/quiz/types'

interface QuizQuestionProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  showFeedback: boolean
  feedback: string | null
  isCorrect: boolean | null
  onSubmit: (answer: any) => void
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  showFeedback,
  feedback,
  isCorrect,
  onSubmit,
}: QuizQuestionProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [matchPairs, setMatchPairs] = useState<Record<string, string>>({})

  const handleSubmit = () => {
    switch (question.question_type) {
      case 'opcion_multiple':
      case 'verdadero_falso':
        if (selectedAnswer !== null) onSubmit(selectedAnswer)
        break
      case 'completar':
        if (textAnswer.trim()) onSubmit(textAnswer.trim())
        break
      case 'ordenar':
        if (orderItems.length > 0) onSubmit(orderItems.map((i: any) => i.id))
        break
      case 'asociar':
        if (Object.keys(matchPairs).length > 0) onSubmit(matchPairs)
        break
    }
  }

  const canSubmit = () => {
    switch (question.question_type) {
      case 'opcion_multiple':
      case 'verdadero_falso':
        return selectedAnswer !== null
      case 'completar':
        return textAnswer.trim().length > 0
      case 'ordenar':
        return orderItems.length === question.options.length
      case 'asociar':
        return Object.keys(matchPairs).length === question.options.length
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Question header */}
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-sm">
          Pregunta {questionNumber} de {totalQuestions}
        </Badge>
        <Badge variant="secondary">
          {question.points} {question.points === 1 ? 'punto' : 'puntos'}
        </Badge>
      </div>

      {/* Question text */}
      <div>
        <h2 className="text-xl font-semibold mb-2">{question.question_text}</h2>
        {question.question_image_url && (
          <img
            src={question.question_image_url}
            alt="Imagen de la pregunta"
            className="max-w-md rounded-lg border mt-3"
          />
        )}
      </div>

      {/* Hint */}
      {question.feedback_hint && !showFeedback && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <Lightbulb className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Pista:</strong> {question.feedback_hint}
          </AlertDescription>
        </Alert>
      )}

      {/* Answer options by type */}
      <div className="space-y-3">
        {(question.question_type === 'opcion_multiple' || question.question_type === 'verdadero_falso') && (
          <>
            {question.options.map((option: any) => (
              <button
                key={option.id}
                onClick={() => !showFeedback && setSelectedAnswer(option.id)}
                disabled={showFeedback}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  !showFeedback && selectedAnswer === option.id && 'border-blue-500 bg-blue-50',
                  !showFeedback && selectedAnswer !== option.id && 'border-gray-200 hover:border-gray-300 hover:bg-gray-50',
                  showFeedback && option.id === question.correct_answer && 'border-green-500 bg-green-50',
                  showFeedback && selectedAnswer === option.id && option.id !== question.correct_answer && 'border-red-500 bg-red-50',
                  showFeedback && selectedAnswer !== option.id && option.id !== question.correct_answer && 'border-gray-200 opacity-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2',
                    !showFeedback && selectedAnswer === option.id && 'border-blue-500 bg-blue-500 text-white',
                    !showFeedback && selectedAnswer !== option.id && 'border-gray-300',
                    showFeedback && option.id === question.correct_answer && 'border-green-500 bg-green-500 text-white',
                    showFeedback && selectedAnswer === option.id && option.id !== question.correct_answer && 'border-red-500 bg-red-500 text-white',
                  )}>
                    {showFeedback && option.id === question.correct_answer ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : showFeedback && selectedAnswer === option.id ? (
                      <XCircle className="h-5 w-5" />
                    ) : (
                      String.fromCharCode(65 + question.options.indexOf(option))
                    )}
                  </div>
                  <span className="font-medium">{option.text}</span>
                </div>
              </button>
            ))}
          </>
        )}

        {question.question_type === 'completar' && (
          <div>
            <input
              type="text"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              disabled={showFeedback}
              placeholder="Escribe tu respuesta..."
              className="w-full p-4 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
              onKeyDown={(e) => e.key === 'Enter' && canSubmit() && handleSubmit()}
            />
          </div>
        )}

        {question.question_type === 'ordenar' && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground mb-3">
              Arrastra o haz clic en el orden correcto:
            </p>
            {question.options.map((option: any, idx: number) => {
              const isOrdered = orderItems.some((i: any) => i.id === option.id)
              const orderPosition = orderItems.findIndex((i: any) => i.id === option.id)
              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (showFeedback) return
                    if (isOrdered) {
                      setOrderItems(orderItems.filter((i: any) => i.id !== option.id))
                    } else {
                      setOrderItems([...orderItems, option])
                    }
                  }}
                  disabled={showFeedback}
                  className={cn(
                    'w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3',
                    isOrdered ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                  )}
                >
                  {isOrdered && (
                    <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0">
                      {orderPosition + 1}
                    </Badge>
                  )}
                  <span>{option.text}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Feedback */}
      {showFeedback && feedback && (
        <Alert className={cn(
          isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
        )}>
          {isCorrect ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={isCorrect ? 'text-green-800' : 'text-red-800'}>
            {feedback}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit button */}
      {!showFeedback && (
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit()}
          size="lg"
          className="w-full"
        >
          Responder
        </Button>
      )}
    </div>
  )
}
