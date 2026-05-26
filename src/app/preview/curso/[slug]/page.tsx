/**
 * Detalle de curso.
 * URL: /preview/curso/[slug]   (ej. /preview/curso/matematica-4_basico)
 *
 * Layout "tabla de contenidos de libro": hero con asignatura/nivel/título,
 * luego una lista por unidad con sus lecciones ordenadas. Cada lección
 * publicada es clickeable; las no publicadas se muestran en gris.
 */
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen, Clock, Layers, Sparkles, Zap } from 'lucide-react'
import {
  formatGradeLevel,
  getCourseDetail,
  lessonHref,
  subjectBadgeStyles,
  type PreviewLesson,
  type PreviewUnit,
} from '@/lib/preview'
import TopBar from '../../top-bar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourseDetail(slug)
  if (!course) return { title: 'Curso no encontrado · Barkley' }
  return {
    title: `${course.title} · Barkley`,
    description: course.description ?? `Curso ${course.title} en Barkley.`,
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourseDetail(slug)
  if (!course) notFound()

  const badge = subjectBadgeStyles(course.subject?.name)

  return (
    <div className="min-h-screen bg-[#FDFBF7] antialiased">
      <TopBar course={{ title: course.title, slug: course.slug }} />

      {/* ===== HERO ===== */}
      <header className="relative overflow-hidden border-b border-[#EFE7D5]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 31px, rgba(180, 160, 130, 0.18) 31px, rgba(180, 160, 130, 0.18) 32px, transparent 32px)',
            backgroundSize: '100% 32px',
          }}
        />
        <div
          aria-hidden
          className="absolute -top-32 -left-20 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFE4D1 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
          <div className="flex flex-wrap items-center gap-2 text-[13px]">
            <Link
              href="/preview"
              className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[12px] font-medium text-[#5A4F47] ring-1 ring-[#EFE7D5] transition hover:bg-[#F7F2E8]"
            >
              ← Catálogo
            </Link>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-inset ${badge.bg} ${badge.text} ${badge.ring}`}
            >
              {course.subject?.name ?? 'Curso'}
            </span>
            <span className="rounded-full bg-white px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-[#5A4F47] ring-1 ring-[#EFE7D5]">
              {formatGradeLevel(course.grade_level)}
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl font-heading text-[40px] font-semibold leading-[1.05] tracking-tight text-[#2C2826] md:text-[56px]">
            <span className="barkley-underline">{course.title}</span>
          </h1>

          {course.description && (
            <p className="mt-5 max-w-2xl text-[16px] leading-relaxed text-[#5A4F47] md:text-[17px]">
              {course.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-2.5">
            <MetaPill icon={<Layers className="h-4 w-4 text-[#0369A1]" />} bg="bg-[#DBF1FF]" value={course.total_units} label={course.total_units === 1 ? 'unidad' : 'unidades'} />
            <MetaPill icon={<BookOpen className="h-4 w-4 text-[#047857]" />} bg="bg-[#D1FAE5]" value={course.published_lessons} label={course.published_lessons === 1 ? 'lección publicada' : 'lecciones publicadas'} />
            <span className="inline-flex items-center gap-2 rounded-2xl bg-[#D1FAE5] px-3.5 py-2.5 text-sm font-semibold text-[#047857] ring-1 ring-[#A7F3D0]">
              <Sparkles className="h-4 w-4" />
              Preview gratuito
            </span>
          </div>
        </div>
      </header>

      {/* ===== TABLA DE CONTENIDOS ===== */}
      <main className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
        {course.units.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-10">
            {course.units.map((u, i) => (
              <UnitBlock key={u.id} unit={u} index={i + 1} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-[#EFE7D5] py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 px-4 text-[12px] text-[#8A7F75] md:flex-row md:items-center md:px-8">
          <Link href="/preview" className="font-medium text-[#5A4F47] transition hover:text-[#C2410C]">
            ← Volver al catálogo
          </Link>
          <div>Barkley · Preview público</div>
        </div>
      </footer>
    </div>
  )
}

function MetaPill({ icon, bg, value, label }: { icon: React.ReactNode; bg: string; value: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C2826] shadow-[0_1px_0_rgba(44,40,38,0.04),0_4px_12px_-6px_rgba(44,40,38,0.10)] ring-1 ring-[#EFE7D5]">
      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>{icon}</span>
      <span>
        <span className="font-semibold">{value}</span>{' '}
        <span className="text-[#8A7F75]">{label}</span>
      </span>
    </div>
  )
}

function UnitBlock({ unit, index }: { unit: PreviewUnit; index: number }) {
  const published = unit.lessons.filter((l) => l.is_published)
  return (
    <section className="rounded-[28px] border border-[#EFE7D5] bg-white p-6 shadow-[0_1px_0_rgba(44,40,38,0.03),0_8px_24px_-12px_rgba(44,40,38,0.10)] md:p-8">
      <header className="mb-6 flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#FFE4D1] font-heading text-lg font-bold text-[#C2410C] ring-1 ring-inset ring-[#FFCAB8]">
          {String(index).padStart(2, '0')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#C2410C]">
            Unidad {index}
          </div>
          <h2 className="mt-1 font-heading text-[24px] font-semibold leading-tight tracking-tight text-[#2C2826] md:text-[28px]">
            {unit.title}
          </h2>
          <div className="mt-1.5 text-[12px] text-[#8A7F75]">
            {published.length} de {unit.lessons.length}{' '}
            {unit.lessons.length === 1 ? 'lección' : 'lecciones'} publicadas
          </div>
        </div>
      </header>

      {unit.lessons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#EFE7D5] bg-[#FDFBF7] px-4 py-8 text-center text-sm text-[#8A7F75]">
          Esta unidad todavía no tiene lecciones cargadas.
        </div>
      ) : (
        <ul className="divide-y divide-[#EFE7D5]">
          {unit.lessons.map((l, idx) => (
            <li key={l.id}>
              <LessonRow lesson={l} index={idx + 1} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function LessonRow({ lesson, index }: { lesson: PreviewLesson; index: number }) {
  const difficulty = lesson.difficulty_level ?? 2
  const isEssential = difficulty <= 2
  const minutes = lesson.estimated_minutes ?? 15

  if (!lesson.is_published) {
    return (
      <div className="flex items-center gap-4 py-3.5 opacity-55">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F7F2E8] font-mono text-[12px] text-[#8A7F75]">
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-medium text-[#8A7F75]">{lesson.title}</div>
          <div className="mt-0.5 text-[11px] text-[#B8AFA4]">{lesson.oa_code}</div>
        </div>
        <span className="rounded-full bg-[#F7F2E8] px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-semibold text-[#8A7F75]">
          Pronto
        </span>
      </div>
    )
  }

  return (
    <Link
      href={lessonHref(lesson.slug)}
      className="group -mx-3 flex items-center gap-4 rounded-xl px-3 py-3.5 transition hover:bg-[#FFF7ED]"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#FFE4D1] font-mono text-[12px] font-semibold text-[#C2410C] group-hover:bg-[#F97316] group-hover:text-white transition">
        {String(index).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-[#2C2826] md:text-[16px]">
            {lesson.title}
          </span>
          <span
            className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ring-1 ring-inset md:inline-block ${
              isEssential
                ? 'bg-[#D1FAE5] text-[#047857] ring-[#A7F3D0]'
                : 'bg-[#EDE9FE] text-[#6D28D9] ring-[#DDD6FE]'
            }`}
          >
            {isEssential ? 'Esencial' : 'Avanzado'}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#8A7F75]">
          <span className="font-mono">{lesson.oa_code}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" /> {minutes} min
          </span>
          <span className="inline-flex items-center gap-1">
            <Zap className="h-3 w-3" /> Nivel {difficulty}/5
          </span>
        </div>
      </div>

      <ArrowRight className="hidden h-4 w-4 shrink-0 text-[#8A7F75] transition group-hover:translate-x-0.5 group-hover:text-[#C2410C] sm:block" />
    </Link>
  )
}

function Empty() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-[#EFE7D5] bg-white px-6 py-20 text-center">
      <Sparkles className="mx-auto h-7 w-7 text-[#F97316]" />
      <div className="mt-3 font-heading text-xl font-semibold text-[#2C2826]">
        Curso en preparación
      </div>
      <p className="mt-1 text-sm text-[#8A7F75]">Las unidades aparecerán aquí en cuanto se publiquen.</p>
    </div>
  )
}
