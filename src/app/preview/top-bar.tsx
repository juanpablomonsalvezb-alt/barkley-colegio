/**
 * Top bar permanente para todas las páginas /preview/*.
 *
 * Sticky, semitransparente, breadcrumb compacto:
 *   Barkley › [Curso] › [Lección]
 */
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { courseHref } from '@/lib/preview'

interface TopBarProps {
  course?: { title: string; slug: string } | null
  lessonTitle?: string | null
  rightSlot?: React.ReactNode
}

export default function TopBar({ course, lessonTitle, rightSlot }: TopBarProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-[#EFE7D5] bg-[#FDFBF7]/85 backdrop-blur-md supports-[backdrop-filter]:bg-[#FDFBF7]/70 print:hidden">
      <div className="mx-auto flex h-12 max-w-6xl items-center gap-2 px-4 md:px-8">
        <Link
          href="/preview"
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[13px] font-bold text-[#C2410C] transition hover:bg-[#FFE4D1]/60"
        >
          <span className="grid h-5 w-5 place-items-center rounded bg-[#F97316] text-[10px] font-black text-white">
            B
          </span>
          <span>Barkley</span>
        </Link>

        {course && (
          <>
            <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#B8AFA4]" />
            <Link
              href={courseHref(course.slug)}
              className="truncate rounded-md px-1.5 py-1 text-[13px] font-medium text-[#5A4F47] transition hover:bg-[#F7F2E8] hover:text-[#2C2826]"
            >
              {course.title}
            </Link>
          </>
        )}

        {lessonTitle && (
          <>
            <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-[#B8AFA4]" />
            <span className="hidden truncate text-[13px] text-[#2C2826] md:inline">
              {lessonTitle}
            </span>
          </>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2">{rightSlot}</div>
      </div>
    </div>
  )
}
