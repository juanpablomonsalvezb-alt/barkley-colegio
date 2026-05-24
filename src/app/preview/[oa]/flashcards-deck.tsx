'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Flashcard {
  front: string
  back: string
}

interface FlashcardsDeckProps {
  cards: Flashcard[]
}

/**
 * NotebookLM devuelve textos con LaTeX inline tipo `$10\ 000$` o `$2\ 346$`.
 * Convertimos a algo legible: quitamos `$`, reemplazamos `\ ` (espacio escapado)
 * por espacio fino y limpiamos backslashes residuales.
 */
function pretty(text: string): string {
  return text
    .replace(/\$([^$]+)\$/g, (_, inner: string) =>
      inner
        .replace(/\\\s/g, ' ') // espacio escapado -> narrow nbsp
        .replace(/\\,/g, ' ')
        .replace(/\\;/g, ' ')
        .replace(/\\/g, '')
        .trim()
    )
    .replace(/\\\$/g, '$')
}

export default function FlashcardsDeck({ cards }: FlashcardsDeckProps) {
  const [order, setOrder] = useState<number[]>(() => cards.map((_, i) => i))
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)

  if (!cards || cards.length === 0) return null

  const card = cards[order[idx]]
  const total = cards.length

  const next = () => {
    setFlipped(false)
    setIdx((i) => (i + 1) % total)
  }
  const prev = () => {
    setFlipped(false)
    setIdx((i) => (i - 1 + total) % total)
  }
  const reset = () => {
    setOrder(cards.map((_, i) => i))
    setIdx(0)
    setFlipped(false)
  }
  const shuffle = () => {
    const arr = [...order]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setOrder(arr)
    setIdx(0)
    setFlipped(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <div className="font-mono tabular-nums text-slate-500">
          {idx + 1} <span className="text-slate-300">/</span> {total}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={shuffle} className="h-8 gap-1.5 text-slate-600">
            <Shuffle className="h-3.5 w-3.5" /> Mezclar
          </Button>
          <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-1.5 text-slate-600">
            <RotateCcw className="h-3.5 w-3.5" /> Reiniciar
          </Button>
        </div>
      </div>

      {/* Card */}
      <div className="perspective-[1200px]">
        <button
          onClick={() => setFlipped((f) => !f)}
          className="group relative block w-full text-left"
          aria-label="Voltear flashcard"
        >
          <div
            className="relative h-72 w-full transition-transform duration-500"
            style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0)' }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm transition group-hover:shadow-md"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Pregunta</div>
              <div className="mt-3 text-2xl font-semibold text-slate-900 leading-snug">{pretty(card.front)}</div>
              <div className="mt-6 text-xs text-slate-400">Click para revelar</div>
            </div>
            {/* Back */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-8 text-center shadow-sm"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div className="text-[10px] uppercase tracking-widest font-semibold text-indigo-600">Respuesta</div>
              <div className="mt-3 text-xl text-slate-800 leading-relaxed">{pretty(card.back)}</div>
            </div>
          </div>
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
          style={{ width: `${((idx + 1) / total) * 100}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={prev} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Anterior
        </Button>
        <Button onClick={next} className="gap-1.5 bg-slate-900 hover:bg-slate-800">
          Siguiente <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
