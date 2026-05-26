/**
 * Navegación anterior / siguiente al pie de cada lección.
 * Si no hay vecino, muestra un placeholder muerto (queda alineado).
 */
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { lessonHref, type PreviewLesson } from '@/lib/preview'

interface LessonNavProps {
  prev: PreviewLesson | null
  next: PreviewLesson | null
}

export default function LessonNav({ prev, next }: LessonNavProps) {
  if (!prev && !next) return null
  return (
    <nav
      aria-label="Navegación entre lecciones"
      className="mt-12 grid grid-cols-1 gap-3 md:mt-16 md:grid-cols-2 print:hidden"
    >
      {prev ? (
        <Link
          href={lessonHref(prev.slug)}
          className="group flex flex-col gap-1 rounded-2xl border border-[#EFE7D5] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#FFCAB8] hover:shadow-[0_8px_24px_-12px_rgba(44,40,38,0.18)]"
        >
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7F75]">
            <ArrowLeft className="h-3 w-3" /> Lección anterior
          </span>
          <span className="mt-1 line-clamp-2 font-heading text-[17px] font-semibold leading-snug text-[#2C2826] group-hover:text-[#C2410C]">
            {prev.title}
          </span>
          <span className="font-mono text-[11px] text-[#8A7F75]">{prev.oa_code}</span>
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}

      {next ? (
        <Link
          href={lessonHref(next.slug)}
          className="group flex flex-col gap-1 rounded-2xl border border-[#EFE7D5] bg-white p-5 text-right transition hover:-translate-y-0.5 hover:border-[#FFCAB8] hover:shadow-[0_8px_24px_-12px_rgba(44,40,38,0.18)]"
        >
          <span className="inline-flex items-center justify-end gap-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7F75]">
            Lección siguiente <ArrowRight className="h-3 w-3" />
          </span>
          <span className="mt-1 line-clamp-2 font-heading text-[17px] font-semibold leading-snug text-[#2C2826] group-hover:text-[#C2410C]">
            {next.title}
          </span>
          <span className="font-mono text-[11px] text-[#8A7F75]">{next.oa_code}</span>
        </Link>
      ) : (
        <div className="hidden md:block" />
      )}
    </nav>
  )
}
