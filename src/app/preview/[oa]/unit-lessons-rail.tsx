/**
 * Bloque "Otras lecciones en esta unidad" para el sidebar de la lección.
 * Se renderiza ARRIBA de SectionNav. Server component puro.
 */
import Link from 'next/link'
import { lessonHref, type PreviewLesson } from '@/lib/preview'

interface UnitLessonsRailProps {
  currentId: string
  unitTitle: string
  lessons: PreviewLesson[]
}

export default function UnitLessonsRail({ currentId, unitTitle, lessons }: UnitLessonsRailProps) {
  // Filtramos la actual; si no queda nada, no renderizamos.
  const others = lessons.filter((l) => l.id !== currentId)
  if (others.length === 0) return null

  return (
    <div className="hidden lg:block">
      <div className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8A7F75]">
        Otras en {unitTitle}
      </div>
      <ul className="mb-6 space-y-0.5 border-l border-[#EFE7D5] pl-2">
        {others.map((l) => (
          <li key={l.id}>
            <Link
              href={lessonHref(l.slug)}
              className="group flex items-start gap-2 rounded-lg px-2.5 py-1.5 text-[13px] leading-snug text-[#5A4F47] transition hover:bg-[#F7F2E8] hover:text-[#2C2826]"
              title={l.title}
            >
              <span className="mt-[3px] inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4C7B5] group-hover:bg-[#F97316]" />
              <span className="line-clamp-2">{l.title}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mb-4 h-px bg-[#EFE7D5]" />
    </div>
  )
}
