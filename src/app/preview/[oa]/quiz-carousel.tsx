'use client'

/**
 * Carrusel de quiz con navegación por dots, teclado y swipe.
 * Mantiene el "modo preview" (respuesta correcta marcada en verde y feedback
 * pedagógico expandible) pero muestra una sola pregunta a la vez para no
 * generar scroll infinito en lecciones con 20+ preguntas.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export interface QuizQuestion {
  id: string
  question_type: string
  question_text: string
  options: Array<{ id: string; text: string }> | Record<string, string>
  correct_answer: string | string[] | Record<string, string>
  feedback_correct: string
  feedback_incorrect: string
  feedback_hint: string | null
  feedback_per_option: Record<string, string> | null
  difficulty_level: number
  points: number
  topic_tag: string | null
}

interface QuizCarouselProps {
  questions: QuizQuestion[]
}

function normalizeOptions(q: QuizQuestion) {
  if (Array.isArray(q.options)) {
    return q.options.map((o, i) => {
      if (typeof o === 'string') return { id: String.fromCharCode(97 + i), text: o }
      return { id: o.id ?? String.fromCharCode(97 + i), text: o.text ?? '' }
    })
  }
  return Object.entries(q.options ?? {}).map(([id, text]) => ({ id, text: String(text) }))
}

export default function QuizCarousel({ questions }: QuizCarouselProps) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState<1 | -1>(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)

  const total = questions.length
  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next))
      if (clamped === idx) return
      setDir(clamped > idx ? 1 : -1)
      setIdx(clamped)
    },
    [idx, total]
  )
  const prev = useCallback(() => goTo(idx - 1), [goTo, idx])
  const next = useCallback(() => goTo(idx + 1), [goTo, idx])

  // Teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        next()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prev()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  // Swipe (touch)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = e.changedTouches[0].clientY - touchStartY.current
    touchStartX.current = null
    touchStartY.current = null
    // Solo swipe horizontal claro (descarta scroll vertical)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next()
      else prev()
    }
  }

  if (total === 0) return null
  const q = questions[idx]
  const opts = normalizeOptions(q)
  const correct = q.correct_answer
  const isCorrect = (id: string) => (Array.isArray(correct) ? correct.includes(id) : correct === id)
  const noOpts = opts.length === 0 || q.question_type === 'completar' || q.question_type === 'ordenar'
  const progress = ((idx + 1) / total) * 100

  return (
    <div className="space-y-5">
      {/* Header: contador + progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <div className="font-mono tabular-nums text-slate-600">
            Pregunta <span className="text-slate-900 font-semibold">{idx + 1}</span>{' '}
            <span className="text-slate-300">de</span> {total}
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              ←
            </kbd>
            <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
              →
            </kbd>
            <span>para navegar</span>
          </div>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-[width] duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Slide */}
      <div
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
      >
        <div
          key={q.id}
          className="p-6 md:p-8 quiz-slide"
          style={{
            animation: `quizSlide${dir === 1 ? 'Right' : 'Left'} 320ms cubic-bezier(0.22, 1, 0.36, 1)`,
          }}
        >
          {/* Pregunta */}
          <div className="flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-mono font-semibold text-white tabular-nums">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-900 leading-snug text-lg md:text-xl">
                {q.question_text}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                <Badge variant="outline" className="font-mono uppercase tracking-wider text-slate-500">
                  {q.question_type}
                </Badge>
                <Badge variant="outline" className="text-slate-500">
                  {'⚡'.repeat(q.difficulty_level)}
                </Badge>
                {q.topic_tag && (
                  <Badge variant="outline" className="text-slate-500">
                    {q.topic_tag}
                  </Badge>
                )}
                <Badge variant="outline" className="text-slate-500">
                  {q.points} pts
                </Badge>
              </div>
            </div>
          </div>

          {/* Opciones */}
          {!noOpts && opts.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {opts.map((opt) => {
                const ok = isCorrect(opt.id)
                return (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                      ok
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                        ok
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-500 ring-1 ring-slate-200'
                      }`}
                    >
                      {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
                    </span>
                    <span className={ok ? 'font-medium' : ''}>{opt.text}</span>
                  </div>
                )
              })}
            </div>
          )}

          {noOpts && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                Respuesta correcta
              </span>
              <div className="mt-1 font-mono text-emerald-900">
                {typeof correct === 'string' ? correct : JSON.stringify(correct)}
              </div>
            </div>
          )}

          {/* Feedback expandible */}
          <details className="group/det mt-6 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
            <summary className="cursor-pointer list-none px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider">Ver feedback pedagógico</span>
              <span className="ml-auto text-slate-400 group-open/det:rotate-90 transition-transform">
                ›
              </span>
            </summary>
            <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-3 text-sm">
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                    Si responde correcto
                  </div>
                  <div className="text-slate-700">{q.feedback_correct}</div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-700">
                    Si responde incorrecto
                  </div>
                  <div className="text-slate-700">{q.feedback_incorrect}</div>
                </div>
              </div>
              {q.feedback_hint && (
                <div className="flex gap-2.5">
                  <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-700">
                      Pista
                    </div>
                    <div className="text-slate-700">{q.feedback_hint}</div>
                  </div>
                </div>
              )}
              {q.feedback_per_option && Object.keys(q.feedback_per_option).length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">
                    Feedback por opción
                  </div>
                  <ul className="space-y-1.5">
                    {Object.entries(q.feedback_per_option).map(([id, txt]) => (
                      <li key={id} className="flex gap-2 text-slate-700">
                        <span className="font-mono text-xs text-slate-400 mt-0.5">{id})</span>
                        <span>{txt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>
      </div>

      {/* Dots */}
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Navegación de preguntas">
        {questions.map((_, i) => {
          const active = i === idx
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              aria-label={`Ir a la pregunta ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all ${
                active
                  ? 'w-6 bg-slate-900'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          )
        })}
      </div>

      {/* Controles */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={prev}
          disabled={idx === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <div className="text-xs text-slate-400 hidden sm:block">
          Desliza o usa las flechas
        </div>
        <Button
          onClick={next}
          disabled={idx === total - 1}
          className="gap-1.5 bg-slate-900 hover:bg-slate-800"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <style jsx>{`
        @keyframes quizSlideRight {
          from {
            opacity: 0;
            transform: translateX(24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes quizSlideLeft {
          from {
            opacity: 0;
            transform: translateX(-24px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
