/**
 * Index global del preview.
 * URL: /preview
 *
 * Lista todos los cursos con al menos una lección publicada, agrupados por
 * asignatura. Diseño tipo "biblioteca" — cálido, denso, sin floritura
 * marketinera.
 */
import Link from 'next/link'
import { ArrowRight, BookOpen, GraduationCap, Sparkles } from 'lucide-react'
import {
  courseHref,
  formatGradeLevel,
  listPublishedCourses,
  subjectBadgeStyles,
  type PreviewCourse,
} from '@/lib/preview'
import TopBar from './top-bar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Barkley · Preview de cursos',
  description:
    'Catálogo público de lecciones Barkley: podcast, video, lección, quiz y materiales de estudio listos para usar.',
}

export default async function PreviewIndexPage() {
  const courses = await listPublishedCourses()

  // Agrupamos por asignatura para una grilla "tipo Linear docs": cada
  // sección es una materia, dentro las tarjetas de cursos.
  const bySubject = new Map<string, { name: string; courses: PreviewCourse[] }>()
  for (const c of courses) {
    const key = c.subject?.name ?? 'Otros'
    const bucket = bySubject.get(key) ?? { name: key, courses: [] }
    bucket.courses.push(c)
    bySubject.set(key, bucket)
  }
  const subjects = Array.from(bySubject.values()).sort((a, b) =>
    a.name.localeCompare(b.name, 'es')
  )

  const totalLessons = courses.reduce((acc, c) => acc + c.published_lessons, 0)

  return (
    <div className="min-h-screen bg-[#FDFBF7] antialiased">
      <TopBar />

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
        <div
          aria-hidden
          className="absolute -bottom-24 -right-20 h-[360px] w-[360px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FEF3C7 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-8 md:py-20">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-[#C2410C] shadow-sm ring-1 ring-[#FFE4D1]">
            <Sparkles className="h-3 w-3" />
            Preview público · acceso gratuito
          </div>
          <h1 className="mt-5 max-w-3xl font-heading text-[44px] font-semibold leading-[1.04] tracking-tight text-[#2C2826] md:text-[64px]">
            <span className="barkley-underline">Biblioteca</span> Barkley
          </h1>
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[#5A4F47] md:text-[19px]">
            Cursos completos alineados a los Objetivos de Aprendizaje del MINEDUC.
            Cada lección incluye podcast, video, contenido escrito, quiz y material
            descargable.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5">
            <Stat icon={<BookOpen className="h-4 w-4 text-[#C2410C]" />} value={String(courses.length)} label="cursos" />
            <Stat
              icon={<GraduationCap className="h-4 w-4 text-[#047857]" />}
              value={String(totalLessons)}
              label="lecciones publicadas"
            />
          </div>
        </div>
      </header>

      {/* ===== CONTENIDO ===== */}
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16">
        {courses.length === 0 ? (
          <EmptyCatalog />
        ) : (
          <div className="space-y-14">
            {subjects.map((s) => {
              const badge = subjectBadgeStyles(s.name)
              return (
                <section key={s.name}>
                  <div className="mb-5 flex items-baseline gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-inset ${badge.bg} ${badge.text} ${badge.ring}`}
                    >
                      {s.name}
                    </span>
                    <span className="text-[12px] text-[#8A7F75]">
                      {s.courses.length} {s.courses.length === 1 ? 'curso' : 'cursos'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {s.courses.map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </main>

      <footer className="border-t border-[#EFE7D5] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 text-[12px] text-[#8A7F75] md:flex-row md:items-center md:px-8">
          <div>Preview público · contenido pedagógico curado</div>
          <div>Hecho con cariño en Chile · Barkley</div>
        </div>
      </footer>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C2826] shadow-[0_1px_0_rgba(44,40,38,0.04),0_4px_12px_-6px_rgba(44,40,38,0.10)] ring-1 ring-[#EFE7D5]">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FFE4D1]">{icon}</span>
      <span>
        <span className="font-semibold">{value}</span>{' '}
        <span className="text-[#8A7F75]">{label}</span>
      </span>
    </div>
  )
}

function CourseCard({ course }: { course: PreviewCourse }) {
  const badge = subjectBadgeStyles(course.subject?.name)
  return (
    <Link
      href={courseHref(course.slug)}
      className="group flex h-full flex-col gap-4 rounded-3xl border border-[#EFE7D5] bg-white p-5 shadow-[0_1px_0_rgba(44,40,38,0.03),0_8px_24px_-12px_rgba(44,40,38,0.10)] transition hover:-translate-y-0.5 hover:border-[#FFCAB8] hover:shadow-[0_2px_0_rgba(44,40,38,0.04),0_16px_40px_-16px_rgba(44,40,38,0.14)]"
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${badge.bg} ${badge.text} ${badge.ring}`}
        >
          {course.subject?.name ?? 'Curso'}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#8A7F75]">
          {formatGradeLevel(course.grade_level)}
        </span>
      </div>

      <h3 className="font-heading text-[22px] font-semibold leading-tight text-[#2C2826]">
        {course.title}
      </h3>

      {course.description && (
        <p className="line-clamp-3 text-[14px] leading-relaxed text-[#5A4F47]">
          {course.description}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between border-t border-[#EFE7D5] pt-3">
        <div className="text-[12px] text-[#8A7F75]">
          <span className="font-semibold text-[#2C2826]">{course.published_lessons}</span>{' '}
          {course.published_lessons === 1 ? 'lección' : 'lecciones'} ·{' '}
          <span className="font-semibold text-[#2C2826]">{course.total_units}</span>{' '}
          {course.total_units === 1 ? 'unidad' : 'unidades'}
        </div>
        <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-[#C2410C] transition group-hover:gap-2">
          Explorar
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  )
}

function EmptyCatalog() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-[#EFE7D5] bg-white px-6 py-20 text-center">
      <div className="relative grid h-16 w-16 place-items-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#F97316]/15" />
        <Sparkles className="relative h-7 w-7 text-[#F97316]" />
      </div>
      <div>
        <div className="font-heading text-xl font-semibold text-[#2C2826]">
          Estamos preparando los cursos
        </div>
        <p className="mt-1 max-w-md text-sm text-[#8A7F75]">
          Vuelve en unos minutos: los cursos aparecen aquí en cuanto tengan
          contenido publicado.
        </p>
      </div>
    </div>
  )
}
