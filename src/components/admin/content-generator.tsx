'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { GRADE_LEVELS } from '@/lib/constants'
import {
  Sparkles,
  Loader2,
  Check,
  X,
  BookOpen,
  FileQuestion,
  Shield,
  Rocket,
  Settings2,
  Eye,
  Code2,
  ChevronRight,
} from 'lucide-react'
import type {
  ContentType,
  GenerationParams,
  GenerationJob,
} from '@/lib/content-generation/types'

// ─── Constants ──────────────────────────────────────────────────────────────

const CONTENT_TYPES: {
  value: ContentType
  label: string
  description: string
  icon: typeof BookOpen
}[] = [
  {
    value: 'lesson',
    label: 'Leccion',
    description: 'Guion de video + contenido HTML + resumen',
    icon: BookOpen,
  },
  {
    value: 'quiz',
    label: 'Quiz',
    description: '20+ preguntas con feedback detallado',
    icon: FileQuestion,
  },
  {
    value: 'reinforcement',
    label: 'Refuerzo',
    description: 'Contenido simplificado + preguntas faciles',
    icon: Shield,
  },
  {
    value: 'challenge',
    label: 'Desafio',
    description: 'Contenido avanzado + proyecto practico',
    icon: Rocket,
  },
  {
    value: 'adaptive_rules',
    label: 'Reglas Adaptativas',
    description: 'Mensajes y multiplicadores por camino',
    icon: Settings2,
  },
]

const STYLES = [
  'Explicativo y cercano',
  'Formal y academico',
  'Ludico y gamificado',
  'Practico con ejemplos',
  'Narrativo con historia',
]

const STATUS_COLORS: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  generando: 'bg-blue-100 text-blue-800',
  revision: 'bg-purple-100 text-purple-800',
  aprobado: 'bg-green-100 text-green-800',
  rechazado: 'bg-red-100 text-red-800',
}

const STATUS_LABELS: Record<string, string> = {
  pendiente: 'Pendiente',
  generando: 'Generando...',
  revision: 'En revision',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
}

// ─── Props ──────────────────────────────────────────────────────────────────

interface ContentGeneratorProps {
  subjects: { id: string; name: string; slug: string }[]
  recentJobs: GenerationJob[]
}

// ─── Component ──────────────────────────────────────────────────────────────

export function ContentGenerator({
  subjects,
  recentJobs: initialJobs,
}: ContentGeneratorProps) {
  // State
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<ContentType | null>(null)
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [jobId, setJobId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editedJson, setEditedJson] = useState('')
  const [viewMode, setViewMode] = useState<'preview' | 'json'>('preview')
  const [approving, setApproving] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [reviewNotes, setReviewNotes] = useState('')
  const [recentJobs, setRecentJobs] = useState(initialJobs)

  // Form state
  const [params, setParams] = useState<GenerationParams>({
    subject: '',
    gradeLevel: '',
    topic: '',
    learningObjectives: [''],
    difficulty: 3,
    style: STYLES[0],
    curriculumCode: '',
  })

  // ─── Handlers ───────────────────────────────────────────────────────────

  function handleSelectType(type: ContentType) {
    setSelectedType(type)
    setStep(2)
    setResult(null)
    setError(null)
    setJobId(null)
    setEditedJson('')
  }

  function handleObjectiveChange(index: number, value: string) {
    const updated = [...params.learningObjectives]
    updated[index] = value
    setParams((prev) => ({ ...prev, learningObjectives: updated }))
  }

  function addObjective() {
    setParams((prev) => ({
      ...prev,
      learningObjectives: [...prev.learningObjectives, ''],
    }))
  }

  function removeObjective(index: number) {
    if (params.learningObjectives.length <= 1) return
    setParams((prev) => ({
      ...prev,
      learningObjectives: prev.learningObjectives.filter((_, i) => i !== index),
    }))
  }

  async function handleGenerate() {
    if (!selectedType) return
    setGenerating(true)
    setError(null)
    setResult(null)
    setStep(3)

    try {
      const response = await fetch('/api/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          params: {
            ...params,
            learningObjectives: params.learningObjectives.filter(
              (o) => o.trim().length > 0
            ),
          },
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar contenido.')
      }

      setResult(data.content as Record<string, unknown>)
      setJobId(data.jobId)
      setEditedJson(JSON.stringify(data.content, null, 2))
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido.')
      setStep(4)
    } finally {
      setGenerating(false)
    }
  }

  async function handleApprove() {
    if (!jobId) return
    setApproving(true)
    try {
      const response = await fetch('/api/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approve',
          jobId,
          editedContent: editedJson ? JSON.parse(editedJson) : result,
          reviewNotes,
        }),
      })
      if (response.ok) {
        setRecentJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? { ...j, status: 'aprobado' as const, review_notes: reviewNotes }
              : j
          )
        )
        setStep(1)
        setResult(null)
        setSelectedType(null)
      }
    } catch {
      setError('Error al aprobar.')
    } finally {
      setApproving(false)
    }
  }

  async function handleReject() {
    if (!jobId) return
    setRejecting(true)
    try {
      const response = await fetch('/api/content-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reject',
          jobId,
          reviewNotes,
        }),
      })
      if (response.ok) {
        setRecentJobs((prev) =>
          prev.map((j) =>
            j.id === jobId
              ? {
                  ...j,
                  status: 'rechazado' as const,
                  review_notes: reviewNotes,
                }
              : j
          )
        )
        setStep(1)
        setResult(null)
        setSelectedType(null)
      }
    } catch {
      setError('Error al rechazar.')
    } finally {
      setRejecting(false)
    }
  }

  // ─── Render Helpers ─────────────────────────────────────────────────────

  function renderPreview() {
    if (!result) return null

    switch (selectedType) {
      case 'lesson':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Guion de Video
              </h3>
              <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                {String(result.videoScript ?? '')}
              </div>
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Contenido HTML
              </h3>
              <div
                className="prose prose-sm max-w-none bg-white dark:bg-zinc-900 rounded-lg p-4 border max-h-96 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: String(result.contentHtml ?? ''),
                }}
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">Resumen</h3>
              <p className="text-muted-foreground">
                {String(result.summary ?? '')}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              Tiempo estimado: {String(result.estimatedMinutes ?? '?')} minutos
            </div>
          </div>
        )

      case 'quiz':
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {Array.isArray(result.questions)
                ? result.questions.length
                : 0}{' '}
              preguntas generadas
            </p>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {Array.isArray(result.questions) &&
                (
                  result.questions as {
                    question_text: string
                    question_type: string
                    correct_answer: unknown
                    difficulty_level: number
                    topic_tag: string
                  }[]
                ).map((q, i) => (
                  <Card key={i} className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {i + 1}. {q.question_text}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {q.question_type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Dif. {q.difficulty_level}
                          </Badge>
                          {q.topic_tag && (
                            <Badge variant="secondary" className="text-xs">
                              {q.topic_tag}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs shrink-0">
                        R: {String(q.correct_answer)}
                      </Badge>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )

      case 'reinforcement':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Contenido de Refuerzo
              </h3>
              <div
                className="prose prose-sm max-w-none bg-white dark:bg-zinc-900 rounded-lg p-4 border max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: String(result.contentHtml ?? ''),
                }}
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Preguntas (
                {Array.isArray(result.questions)
                  ? result.questions.length
                  : 0}
                )
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.isArray(result.questions) &&
                  (
                    result.questions as {
                      question_text: string
                      difficulty_level: number
                    }[]
                  ).map((q, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm p-2 bg-muted rounded"
                    >
                      <span className="font-medium">{i + 1}.</span>
                      <span className="flex-1">{q.question_text}</span>
                      <Badge variant="outline" className="text-xs">
                        Dif. {q.difficulty_level}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )

      case 'challenge':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Contenido Avanzado
              </h3>
              <div
                className="prose prose-sm max-w-none bg-white dark:bg-zinc-900 rounded-lg p-4 border max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: String(result.contentHtml ?? ''),
                }}
              />
            </div>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Proyecto Practico
              </h3>
              <div className="bg-muted rounded-lg p-4 whitespace-pre-wrap text-sm leading-relaxed max-h-64 overflow-y-auto">
                {String(result.projectDescription ?? '')}
              </div>
            </div>
          </div>
        )

      case 'adaptive_rules':
        return (
          <div className="grid gap-4 md:grid-cols-3">
            {(['refuerzo', 'normal', 'desafio'] as const).map((path) => {
              const rule = result[path] as
                | {
                    messageTitle: string
                    messageBody: string
                    xpMultiplier: number
                  }
                | undefined
              if (!rule) return null
              const colors = {
                refuerzo: 'border-orange-300 bg-orange-50',
                normal: 'border-blue-300 bg-blue-50',
                desafio: 'border-green-300 bg-green-50',
              }
              return (
                <Card key={path} className={`${colors[path]} border-2`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base capitalize">
                      {path}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-semibold text-sm">
                      {rule.messageTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {rule.messageBody}
                    </p>
                    <Badge variant="outline">
                      XP x{rule.xpMultiplier}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )

      default:
        return null
    }
  }

  // ─── Main Render ────────────────────────────────────────────────────────

  const canGenerate =
    params.subject &&
    params.gradeLevel &&
    params.topic.trim() &&
    params.learningObjectives.some((o) => o.trim().length > 0)

  return (
    <div className="space-y-8">
      {/* Progress Steps */}
      <div className="flex items-center gap-2 text-sm">
        {['Tipo', 'Parametros', 'Generando', 'Resultado'].map(
          (label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  step > i + 1
                    ? 'bg-green-500 text-white'
                    : step === i + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={
                  step === i + 1 ? 'font-medium' : 'text-muted-foreground'
                }
              >
                {label}
              </span>
              {i < 3 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
          )
        )}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {CONTENT_TYPES.map((ct) => {
            const Icon = ct.icon
            return (
              <Card
                key={ct.value}
                className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/50 ${
                  selectedType === ct.value
                    ? 'border-primary ring-2 ring-primary/20'
                    : ''
                }`}
                onClick={() => handleSelectType(ct.value)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{ct.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {ct.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Step 2: Parameters Form */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Parametros de generacion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Asignatura</Label>
                <select
                  id="subject"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={params.subject}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar...</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div className="space-y-2">
                <Label htmlFor="gradeLevel">Nivel</Label>
                <select
                  id="gradeLevel"
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  value={params.gradeLevel}
                  onChange={(e) =>
                    setParams((prev) => ({
                      ...prev,
                      gradeLevel: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Seleccionar...</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Tema</Label>
              <Input
                id="topic"
                placeholder="Ej: Fracciones equivalentes, Conquista de Chile..."
                value={params.topic}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    topic: e.target.value,
                  }))
                }
              />
            </div>

            {/* Learning Objectives */}
            <div className="space-y-2">
              <Label>Objetivos de Aprendizaje</Label>
              {params.learningObjectives.map((obj, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder={`Objetivo ${i + 1}`}
                    value={obj}
                    onChange={(e) =>
                      handleObjectiveChange(i, e.target.value)
                    }
                  />
                  {params.learningObjectives.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeObjective(i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addObjective}>
                + Agregar objetivo
              </Button>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label htmlFor="difficulty">
                Dificultad: {params.difficulty}/5
              </Label>
              <input
                id="difficulty"
                type="range"
                min={1}
                max={5}
                step={1}
                value={params.difficulty}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    difficulty: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                  }))
                }
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Muy facil</span>
                <span>Facil</span>
                <span>Intermedio</span>
                <span>Dificil</span>
                <span>Muy dificil</span>
              </div>
            </div>

            {/* Style */}
            <div className="space-y-2">
              <Label htmlFor="style">Estilo</Label>
              <select
                id="style"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                value={params.style}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    style: e.target.value,
                  }))
                }
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Curriculum Code (optional) */}
            <div className="space-y-2">
              <Label htmlFor="curriculumCode">
                Codigo curricular MINEDUC (opcional)
              </Label>
              <Input
                id="curriculumCode"
                placeholder="Ej: OA7, MA05 OA 03..."
                value={params.curriculumCode}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    curriculumCode: e.target.value,
                  }))
                }
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setStep(1)
                  setSelectedType(null)
                }}
              >
                Volver
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generar con IA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Generating */}
      {step === 3 && generating && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-semibold text-lg">
                Generando contenido con IA...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Esto puede tomar entre 30 segundos y 2 minutos.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Tipo:{' '}
                {CONTENT_TYPES.find((ct) => ct.value === selectedType)?.label} |
                Tema: {params.topic}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Result */}
      {step === 4 && (
        <div className="space-y-4">
          {error && (
            <Card className="border-red-300 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <X className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-red-800">
                      Error en la generacion
                    </p>
                    <p className="text-sm text-red-600 mt-1">{error}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setStep(2)
                    setError(null)
                  }}
                >
                  Intentar de nuevo
                </Button>
              </CardContent>
            </Card>
          )}

          {result && (
            <>
              {/* View mode tabs */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Contenido generado</h2>
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'preview' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('preview')}
                    className="gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Vista previa
                  </Button>
                  <Button
                    variant={viewMode === 'json' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('json')}
                    className="gap-1"
                  >
                    <Code2 className="w-4 h-4" />
                    JSON
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  {viewMode === 'preview' ? (
                    renderPreview()
                  ) : (
                    <textarea
                      value={editedJson}
                      onChange={(e) => setEditedJson(e.target.value)}
                      className="w-full min-h-[400px] rounded-lg border border-input bg-transparent px-3 py-2 font-mono text-xs"
                    />
                  )}
                </CardContent>
              </Card>

              {/* Review Notes */}
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reviewNotes">
                      Notas de revision (opcional)
                    </Label>
                    <textarea
                      id="reviewNotes"
                      placeholder="Agrega notas sobre esta generacion..."
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      className="w-full min-h-[80px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setStep(2)
                        setResult(null)
                        setError(null)
                      }}
                    >
                      Volver a parametros
                    </Button>
                    <Button
                      onClick={handleApprove}
                      disabled={approving}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      {approving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Aprobar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleReject}
                      disabled={rejecting}
                      className="gap-2"
                    >
                      {rejecting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                      Rechazar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}

      {/* Recent Jobs History */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Historial de generaciones
        </h2>
        {recentJobs.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay generaciones recientes.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-left py-3 px-4 font-medium">Tema</th>
                  <th className="text-left py-3 px-4 font-medium">Estado</th>
                  <th className="text-left py-3 px-4 font-medium">Modelo</th>
                  <th className="text-left py-3 px-4 font-medium">Tokens</th>
                  <th className="text-left py-3 px-4 font-medium">Tiempo</th>
                  <th className="text-left py-3 px-4 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
                  const jobParams =
                    job.input_params as GenerationParams | null
                  return (
                    <tr
                      key={job.id}
                      className="border-b hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <Badge variant="outline">{job.target_type}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {jobParams?.topic ?? '-'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={STATUS_COLORS[job.status] ?? ''}>
                          {STATUS_LABELS[job.status] ?? job.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {job.model_used
                          ? job.model_used.replace('claude-', '').slice(0, 12)
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {job.tokens_used?.toLocaleString() ?? '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {job.generation_time_ms
                          ? `${(job.generation_time_ms / 1000).toFixed(1)}s`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(job.created_at).toLocaleDateString('es-CL', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
