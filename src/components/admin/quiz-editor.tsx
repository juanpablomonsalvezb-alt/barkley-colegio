'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { QUESTION_TYPES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Plus, Trash2, GripVertical } from 'lucide-react'

interface QuizQuestion {
  id?: string
  type: string
  text: string
  options: string[]
  correct_answer: number
  feedback_correct: string
  feedback_incorrect: string
  difficulty: number
  topic_tag: string
}

interface QuizEditorProps {
  quiz?: any
  lessonId: string
}

function emptyQuestion(): QuizQuestion {
  return {
    type: 'opcion_multiple',
    text: '',
    options: ['', '', '', ''],
    correct_answer: 0,
    feedback_correct: '',
    feedback_incorrect: '',
    difficulty: 3,
    topic_tag: '',
  }
}

export function QuizEditor({ quiz, lessonId }: QuizEditorProps) {
  const isEdit = !!quiz
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    title: quiz?.title || '',
    passing_score: quiz?.passing_score ?? 70,
    time_limit: quiz?.time_limit ?? 0,
    max_attempts: quiz?.max_attempts ?? 3,
    shuffle_options: quiz?.shuffle_options ?? true,
    is_published: quiz?.is_published ?? false,
    lesson_id: lessonId,
  })
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    quiz?.questions || [emptyQuestion()]
  )

  function addQuestion() {
    setQuestions((prev) => [...prev, emptyQuestion()])
  }

  function removeQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index))
  }

  function updateQuestion(index: number, updates: Partial<QuizQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    )
  }

  function updateOption(questionIndex: number, optionIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = [...q.options]
        options[optionIndex] = value
        return { ...q, options }
      })
    )
  }

  function addOption(questionIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        return { ...q, options: [...q.options, ''] }
      })
    )
  }

  function removeOption(questionIndex: number, optionIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q
        const options = q.options.filter((_, oi) => oi !== optionIndex)
        const correct =
          q.correct_answer === optionIndex
            ? 0
            : q.correct_answer > optionIndex
            ? q.correct_answer - 1
            : q.correct_answer
        return { ...q, options, correct_answer: correct }
      })
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    const supabase = createClient()
    const payload = { ...settings, questions }

    if (isEdit) {
      await supabase.from('quizzes').update(payload).eq('id', quiz.id)
    } else {
      await supabase.from('quizzes').insert(payload)
    }

    setSaving(false)
    window.history.back()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {isEdit ? 'Editar Evaluacion' : 'Nueva Evaluacion'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quiz-title">Titulo</Label>
            <Input
              id="quiz-title"
              value={settings.title}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="passing">Puntaje Aprobacion (%)</Label>
              <Input
                id="passing"
                type="number"
                min={0}
                max={100}
                value={settings.passing_score}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    passing_score: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Tiempo Limite (min, 0=sin limite)</Label>
              <Input
                id="time"
                type="number"
                min={0}
                value={settings.time_limit}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    time_limit: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attempts">Max Intentos</Label>
              <Input
                id="attempts"
                type="number"
                min={1}
                value={settings.max_attempts}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    max_attempts: parseInt(e.target.value) || 1,
                  }))
                }
              />
            </div>
            <div className="flex items-end gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="shuffle"
                  className="h-4 w-4 rounded border-input"
                  checked={settings.shuffle_options}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      shuffle_options: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="shuffle">Mezclar opciones</Label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="quiz-published"
                  className="h-4 w-4 rounded border-input"
                  checked={settings.is_published}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      is_published: e.target.checked,
                    }))
                  }
                />
                <Label htmlFor="quiz-published">Publicado</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {questions.map((question, qi) => (
        <Card key={qi}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              Pregunta {qi + 1}
            </CardTitle>
            {questions.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeQuestion(qi)}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Eliminar
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={question.type}
                  onChange={(e) =>
                    updateQuestion(qi, { type: e.target.value })
                  }
                >
                  {QUESTION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Dificultad</Label>
                <select
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={question.difficulty}
                  onChange={(e) =>
                    updateQuestion(qi, {
                      difficulty: parseInt(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Tema</Label>
                <Input
                  value={question.topic_tag}
                  onChange={(e) =>
                    updateQuestion(qi, { topic_tag: e.target.value })
                  }
                  placeholder="ej: fracciones"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Texto de la pregunta</Label>
              <textarea
                className="min-h-20 w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
                value={question.text}
                onChange={(e) =>
                  updateQuestion(qi, { text: e.target.value })
                }
                required
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Opciones</Label>
              {question.options.map((option, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={question.correct_answer === oi}
                    onChange={() =>
                      updateQuestion(qi, { correct_answer: oi })
                    }
                    className="h-4 w-4"
                  />
                  <Input
                    value={option}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Opcion ${oi + 1}`}
                    className="flex-1"
                  />
                  {question.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(qi, oi)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(qi)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Agregar opcion
              </Button>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Feedback correcto</Label>
                <Input
                  value={question.feedback_correct}
                  onChange={(e) =>
                    updateQuestion(qi, { feedback_correct: e.target.value })
                  }
                  placeholder="Excelente! ..."
                />
              </div>
              <div className="space-y-2">
                <Label>Feedback incorrecto</Label>
                <Input
                  value={question.feedback_incorrect}
                  onChange={(e) =>
                    updateQuestion(qi, {
                      feedback_incorrect: e.target.value,
                    })
                  }
                  placeholder="Revisa el concepto de..."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={addQuestion}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Pregunta
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isEdit ? 'Guardar Cambios' : 'Crear Evaluacion'}
        </Button>
      </div>
    </form>
  )
}
