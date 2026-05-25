'use client'

/**
 * Lista de sets de práctica adicional (quizzes con quiz_kind != 'formal').
 * Cada set se muestra como card con título + dificultad + nº preguntas, y al
 * hacer clic se expande mostrando el QuizCarousel existente con sus preguntas.
 */
import { useState } from 'react'
import { Clock, FileQuestion, Zap, ChevronDown } from 'lucide-react'
import QuizCarousel, { type QuizQuestion } from './quiz-carousel'

export interface PracticeSet {
  id: string
  title: string
  quiz_kind: string
  total_questions: number | null
  time_limit_seconds: number | null
  questions: QuizQuestion[]
}

interface PracticeSetsListProps {
  sets: PracticeSet[]
}

const KIND_META: Record<
  string,
  { label: string; emoji: string; bg: string; text: string; ring: string; accent: string; cardBg: string; cardBorder: string }
> = {
  practice_easy: {
    label: 'Fácil',
    emoji: '🌱',
    bg: 'bg-[#D1FAE5]',
    text: 'text-[#047857]',
    ring: 'ring-[#A7F3D0]',
    accent: '#10B981',
    cardBg: 'bg-[#F0FDF4]',
    cardBorder: 'border-[#A7F3D0]',
  },
  practice_medium: {
    label: 'Medio',
    emoji: '⚡',
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#A16207]',
    ring: 'ring-[#FDE68A]',
    accent: '#F59E0B',
    cardBg: 'bg-[#FFFBEB]',
    cardBorder: 'border-[#FDE68A]',
  },
  practice_hard: {
    label: 'Difícil',
    emoji: '🔥',
    bg: 'bg-[#FFE0D6]',
    text: 'text-[#C2410C]',
    ring: 'ring-[#FFCAB8]',
    accent: '#F97316',
    cardBg: 'bg-[#FFF7ED]',
    cardBorder: 'border-[#FFCAB8]',
  },
  default: {
    label: 'Práctica',
    emoji: '💪',
    bg: 'bg-[#F7F2E8]',
    text: 'text-[#5A4F47]',
    ring: 'ring-[#EFE7D5]',
    accent: '#8A7F75',
    cardBg: 'bg-[#FDFBF7]',
    cardBorder: 'border-[#EFE7D5]',
  },
}

export default function PracticeSetsList({ sets }: PracticeSetsListProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (sets.length === 0) return null

  return (
    <div className="space-y-4">
      {sets.map((set, i) => {
        const meta = KIND_META[set.quiz_kind] ?? KIND_META.default
        const isOpen = openId === set.id
        const timeMin = set.time_limit_seconds ? Math.ceil(set.time_limit_seconds / 60) : null
        const count = set.questions.length || set.total_questions || 0

        return (
          <div
            key={set.id}
            className={`rounded-2xl border-2 transition-all ${
              isOpen
                ? `${meta.cardBorder} ${meta.cardBg} shadow-md`
                : `border-[#EFE7D5] bg-white hover:${meta.cardBorder} hover:${meta.cardBg} shadow-sm hover:shadow-md`
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : set.id)}
              className="flex items-start gap-4 p-5 md:p-6 text-left w-full"
              aria-expanded={isOpen}
              aria-controls={`practice-content-${set.id}`}
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${meta.bg} ring-1 ring-inset ${meta.ring}`}
              >
                {meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#8A7F75]">
                    Set {i + 1}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${meta.bg} ${meta.text} ring-1 ring-inset ${meta.ring}`}
                  >
                    <Zap className="h-3 w-3" />
                    {meta.label}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#2C2826] leading-snug">
                  {set.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[#5A4F47] ring-1 ring-[#EFE7D5]">
                    <FileQuestion className="h-3 w-3" />
                    {count} preguntas
                  </span>
                  {timeMin != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[#5A4F47] ring-1 ring-[#EFE7D5]">
                      <Clock className="h-3 w-3" />
                      {timeMin} min
                    </span>
                  )}
                </div>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-[#5A4F47] transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isOpen && (
              <div
                id={`practice-content-${set.id}`}
                className={`border-t-2 ${meta.cardBorder} px-4 py-5 md:px-6 md:py-7 rounded-b-2xl bg-white/70`}
              >
                {set.questions.length > 0 ? (
                  <QuizCarousel questions={set.questions} />
                ) : (
                  <div className="text-center py-8 text-sm text-[#8A7F75]">
                    No hay preguntas disponibles en este set.
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold ${meta.text} hover:underline`}
                  >
                    Cerrar set ↑
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
