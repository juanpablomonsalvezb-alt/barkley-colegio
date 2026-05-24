'use client'

import { useEffect } from 'react'
import { Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface QuestionOption {
  id: string
  text: string
}

interface Question {
  id: string
  question_type: string
  question_text: string
  options: QuestionOption[] | Record<string, string>
  correct_answer: string | string[] | Record<string, string>
  feedback_correct?: string
  feedback_hint?: string | null
  difficulty_level: number
  points: number
}

interface Props {
  mode: 'ejercicios' | 'solucionario'
  questions: Question[]
  unitTitle: string
  oaCode: string
  gradeLabel: string
  subjectName: string
}

function normalizeOptions(opts: QuestionOption[] | Record<string, string>): QuestionOption[] {
  if (Array.isArray(opts)) return opts
  return Object.entries(opts).map(([id, text]) => ({ id, text: String(text) }))
}

function formatAnswer(answer: any): string {
  if (Array.isArray(answer)) return answer.join(' → ')
  if (typeof answer === 'object' && answer !== null) {
    return Object.entries(answer).map(([k, v]) => `${k}: ${v}`).join(', ')
  }
  return String(answer)
}

export default function WorksheetView({
  mode,
  questions,
  unitTitle,
  oaCode,
  gradeLabel,
  subjectName,
}: Props) {
  const showSolutions = mode === 'solucionario'
  const oa = oaCode.toLowerCase()
  const backUrl = `/preview/${oa}`

  // Auto-prompt print al cargar (3s delay para ver primero)
  // useEffect(() => {
  //   const t = setTimeout(() => window.print(), 1500)
  //   return () => clearTimeout(t)
  // }, [])

  return (
    <div className="min-h-screen bg-white antialiased">
      {/* Toolbar (no se imprime) */}
      <div className="no-print sticky top-0 z-50 border-b border-[#EFE7D5] bg-[#FDFBF7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-3">
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-[#5A4F47] hover:bg-[#FFE4D1] hover:text-[#C2410C] transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
          <div className="text-center text-sm font-medium text-[#2C2826]">
            {mode === 'solucionario' ? '🔑 Solucionario' : '📄 Ejercicios'} ·{' '}
            <span className="text-[#8A7F75]">{subjectName}</span>
          </div>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#EA580C] transition"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* Hoja */}
      <div className="worksheet mx-auto max-w-4xl px-6 py-10 md:px-12 md:py-14 bg-white">
        {/* Header impreso */}
        <header className="mb-8 border-b-2 border-[#2C2826] pb-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#8A7F75]">
                🐶 Barkley · {subjectName} · {gradeLabel}
              </p>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-[#2C2826] mt-1 leading-tight">
                {mode === 'solucionario' && '🔑 '}{unitTitle}
              </h1>
              <p className="text-sm text-[#5A4F47] mt-1">
                {mode === 'solucionario'
                  ? 'Solucionario con respuestas y explicaciones · '
                  : 'Hoja de ejercicios · '}
                OA <span className="font-mono">{oaCode}</span>
              </p>
            </div>
            {mode === 'ejercicios' && (
              <div className="text-sm text-[#5A4F47] space-y-1 md:text-right shrink-0">
                <div className="border-b border-dotted border-[#8A7F75] w-56">
                  <span className="text-xs">Nombre:</span>
                </div>
                <div className="border-b border-dotted border-[#8A7F75] w-56">
                  <span className="text-xs">Fecha:</span>
                </div>
                <div className="border-b border-dotted border-[#8A7F75] w-56">
                  <span className="text-xs">Curso:</span>
                </div>
              </div>
            )}
          </div>
          {mode === 'ejercicios' && (
            <p className="mt-4 text-sm italic text-[#5A4F47]">
              ✏️ Lee cada ejercicio con calma y marca o escribe tu respuesta en el espacio indicado.
            </p>
          )}
          {mode === 'solucionario' && (
            <p className="mt-4 text-sm italic text-[#5A4F47]">
              Material para profesor o apoderado. Contiene respuestas correctas y explicaciones.
            </p>
          )}
        </header>

        {/* Ejercicios */}
        <ol className="space-y-6">
          {questions.map((q, idx) => {
            const opts = normalizeOptions(q.options)
            const answer = formatAnswer(q.correct_answer)
            const isOpcionMultiple = q.question_type === 'opcion_multiple' || q.question_type === 'verdadero_falso'
            const isCompletar = q.question_type === 'completar'
            const isOrdenar = q.question_type === 'ordenar'

            return (
              <li key={q.id} className="break-inside-avoid">
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFE4D1] text-sm font-bold text-[#C2410C]">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-[#2C2826] leading-relaxed">
                      {q.question_text}
                    </p>

                    {isOpcionMultiple && opts.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {opts.map((opt) => {
                          const isCorrect =
                            String(q.correct_answer) === opt.id ||
                            (Array.isArray(q.correct_answer) && q.correct_answer.includes(opt.id))
                          return (
                            <div
                              key={opt.id}
                              className={`flex items-start gap-2 rounded-lg border-2 px-3 py-2 ${
                                showSolutions && isCorrect
                                  ? 'border-[#10B981] bg-[#D1FAE5]'
                                  : 'border-[#EFE7D5]'
                              }`}
                            >
                              <span className="font-mono text-sm font-semibold text-[#5A4F47]">
                                {opt.id.toUpperCase()})
                              </span>
                              <span className="text-sm text-[#2C2826] flex-1">{opt.text}</span>
                              {showSolutions && isCorrect && (
                                <span className="text-xs font-bold text-[#047857]">✓</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {isCompletar && (
                      <div className="mt-3">
                        {showSolutions ? (
                          <div className="rounded-lg bg-[#D1FAE5] border-2 border-[#10B981] px-4 py-2 text-sm">
                            <span className="font-semibold text-[#047857]">Respuesta:</span>{' '}
                            <span className="font-mono text-[#2C2826]">{answer}</span>
                          </div>
                        ) : (
                          <div className="h-12 border-b-2 border-[#8A7F75] w-full max-w-md"></div>
                        )}
                      </div>
                    )}

                    {isOrdenar && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-[#5A4F47]">Escribe los IDs en el orden correcto:</p>
                        {opts.map((opt) => (
                          <div key={opt.id} className="flex items-center gap-2 text-sm">
                            <span className="font-mono font-semibold text-[#5A4F47]">{opt.id})</span>
                            <span className="text-[#2C2826]">{opt.text}</span>
                          </div>
                        ))}
                        {showSolutions ? (
                          <div className="rounded-lg bg-[#D1FAE5] border-2 border-[#10B981] px-4 py-2 text-sm mt-2">
                            <span className="font-semibold text-[#047857]">Orden correcto:</span>{' '}
                            <span className="font-mono text-[#2C2826]">{answer}</span>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <p className="text-xs text-[#5A4F47] mb-1">Tu respuesta:</p>
                            <div className="h-10 border-b-2 border-[#8A7F75] w-full max-w-md"></div>
                          </div>
                        )}
                      </div>
                    )}

                    {showSolutions && (q.feedback_correct || q.feedback_hint) && (
                      <div className="mt-3 rounded-lg bg-[#FFE4D1] border border-[#F97316] px-4 py-2">
                        {q.feedback_correct && (
                          <p className="text-sm text-[#2C2826]">
                            <span className="font-semibold text-[#C2410C]">📘 Explicación:</span>{' '}
                            {q.feedback_correct}
                          </p>
                        )}
                        {q.feedback_hint && !q.feedback_correct && (
                          <p className="text-sm text-[#2C2826]">
                            <span className="font-semibold text-[#C2410C]">💡 Pista:</span>{' '}
                            {q.feedback_hint}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        <footer className="mt-12 pt-4 border-t border-[#EFE7D5] flex items-center justify-between text-xs text-[#8A7F75]">
          <span>🐶 Barkley · barkley.cl</span>
          <span className="font-mono">
            {oaCode} · {questions.length} ejercicios · {mode === 'solucionario' ? 'Solucionario' : 'Ejercicios'}
          </span>
        </footer>
      </div>
    </div>
  )
}
