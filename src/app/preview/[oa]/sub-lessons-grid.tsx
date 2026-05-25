'use client'

/**
 * Grid de sub-lecciones (lessons hijas con parent_lesson_id = lección actual).
 * Cada sub-lección se muestra como card expandible. Al hacer clic se despliega
 * el content_html dentro de la card (acordeón estilo cálido).
 */
import { useState } from 'react'
import { Clock, Zap, ChevronDown, BookOpen } from 'lucide-react'

export interface SubLesson {
  id: string
  title: string
  content_html: string | null
  estimated_minutes: number | null
  difficulty_level: number | null
  display_order: number | null
}

interface SubLessonsGridProps {
  subLessons: SubLesson[]
}

export default function SubLessonsGrid({ subLessons }: SubLessonsGridProps) {
  const [openId, setOpenId] = useState<string | null>(null)

  if (subLessons.length === 0) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {subLessons.map((sl, i) => {
        const isOpen = openId === sl.id
        return (
          <div
            key={sl.id}
            className={`group relative flex flex-col rounded-2xl border-2 transition-all ${
              isOpen
                ? 'border-[#10B981] bg-[#F0FDF4] md:col-span-2 shadow-md'
                : 'border-[#D1FAE5] bg-white hover:border-[#10B981] hover:bg-[#F0FDF4] shadow-sm hover:shadow-md'
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : sl.id)}
              className="flex items-start gap-4 p-5 md:p-6 text-left w-full"
              aria-expanded={isOpen}
              aria-controls={`sub-content-${sl.id}`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5] text-[#047857] ring-1 ring-[#A7F3D0]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-[0.18em] font-semibold text-[#047857]">
                    Sub-tema {i + 1}
                  </span>
                </div>
                <h3 className="font-heading text-lg font-semibold text-[#2C2826] leading-snug">
                  {sl.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  {sl.estimated_minutes != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[#5A4F47] ring-1 ring-[#EFE7D5]">
                      <Clock className="h-3 w-3" />
                      {sl.estimated_minutes} min
                    </span>
                  )}
                  {sl.difficulty_level != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[#5A4F47] ring-1 ring-[#EFE7D5]">
                      <Zap className="h-3 w-3" />
                      Nivel {sl.difficulty_level}/5
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

            {isOpen && sl.content_html && (
              <div
                id={`sub-content-${sl.id}`}
                className="border-t border-[#A7F3D0] bg-white/60 px-5 py-5 md:px-8 md:py-7 rounded-b-2xl"
              >
                <article
                  className="prose prose-base max-w-[68ch] prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-semibold prose-headings:text-[#2C2826] prose-h2:text-2xl prose-h3:text-lg prose-p:text-[#3F3833] prose-p:leading-[1.75] prose-strong:text-[#2C2826] prose-a:text-[#047857] prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:bg-[#FEF3C7] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[#A16207] prose-code:before:hidden prose-code:after:hidden prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-[#10B981] prose-blockquote:bg-[#D1FAE5]/40 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-2xl prose-blockquote:font-normal prose-blockquote:text-[#3F3833] prose-li:text-[#3F3833] prose-img:rounded-2xl prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: sl.content_html }}
                />
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#047857] hover:underline"
                >
                  Cerrar ↑
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
