/**
 * Helpers de navegación para todas las páginas /preview/*.
 *
 * Las funciones aquí se ejecutan en Server Components. Usan el service role
 * key porque /preview/* es público (no auth) y la consulta es de lectura pura
 * sobre contenido publicado.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function previewSupabase(): SupabaseClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export type PreviewSubject = {
  id: string
  name: string
  slug: string
  color: string | null
  icon_url: string | null
}

export type PreviewCourse = {
  id: string
  title: string
  slug: string
  description: string | null
  grade_level: string
  subject: PreviewSubject | null
  published_lessons: number
  total_units: number
}

export type PreviewLesson = {
  id: string
  title: string
  slug: string
  oa_code: string
  display_order: number
  difficulty_level: number | null
  estimated_minutes: number | null
  is_published: boolean
  lesson_kind: string | null
  unit_id: string
}

export type PreviewUnit = {
  id: string
  title: string
  slug: string
  display_order: number
  course_id: string
  lessons: PreviewLesson[]
}

export type PreviewCourseDetail = PreviewCourse & {
  units: PreviewUnit[]
}

/** Extrae el OA code (ej. MA04-OA01) desde el slug de lección. */
export function extractOaCode(slug: string): string {
  // slugs vienen como "ma04-oa01-representar-y-describir-numeros..."
  // o "ma04-oa14-sub-1-resolver-..." (sub-lecciones).
  const m = slug.match(/^([a-z]{2}\d{2}-oa\d{1,3})/i)
  return (m?.[1] ?? slug.split('-').slice(0, 2).join('-')).toUpperCase()
}

/** URL canónica de una lección dentro del preview. */
export function lessonHref(slug: string): string {
  const oa = extractOaCode(slug)
  return `/preview/${oa.toLowerCase()}`
}

/** URL canónica de un curso dentro del preview. */
export function courseHref(slug: string): string {
  return `/preview/curso/${slug}`
}

/** Lista todos los cursos que tienen al menos una lección publicada. */
export async function listPublishedCourses(): Promise<PreviewCourse[]> {
  const sb = previewSupabase()

  // Traemos todas las lecciones main publicadas con su course path embebido,
  // luego agregamos por curso. Es UNA query, suficiente para el catálogo.
  const { data, error } = await sb
    .from('lessons')
    .select(
      `id,
       units!inner(
         id,
         course_id,
         courses!inner(
           id, title, slug, description, grade_level,
           subjects(id, name, slug, color, icon_url)
         )
       )`
    )
    .eq('is_published', true)
    .eq('lesson_kind', 'main')

  if (error || !data) return []

  const byCourse = new Map<string, PreviewCourse & { _units: Set<string> }>()

  for (const row of data as unknown as Array<{
    units: {
      id: string
      course_id: string
      courses: {
        id: string
        title: string
        slug: string
        description: string | null
        grade_level: string
        subjects: PreviewSubject | null
      }
    }
  }>) {
    const c = row.units?.courses
    if (!c) continue
    const existing = byCourse.get(c.id)
    if (existing) {
      existing.published_lessons += 1
      existing._units.add(row.units.id)
    } else {
      byCourse.set(c.id, {
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        grade_level: c.grade_level,
        subject: c.subjects ?? null,
        published_lessons: 1,
        total_units: 0,
        _units: new Set([row.units.id]),
      })
    }
  }

  const courses = Array.from(byCourse.values()).map((c) => ({
    ...c,
    total_units: c._units.size,
  }))

  // Orden estable: subject.display_order > grade > title
  return courses
    .map(({ _units, ...rest }) => rest)
    .sort((a, b) => a.title.localeCompare(b.title, 'es'))
}

/** Curso completo (unidades + lecciones main publicadas) por slug. */
export async function getCourseDetail(slug: string): Promise<PreviewCourseDetail | null> {
  const sb = previewSupabase()

  const { data: course } = await sb
    .from('courses')
    .select(
      `id, title, slug, description, grade_level,
       subjects(id, name, slug, color, icon_url)`
    )
    .eq('slug', slug)
    .maybeSingle()

  if (!course) return null

  const { data: unitsData } = await sb
    .from('units')
    .select('id, title, slug, display_order, course_id')
    .eq('course_id', course.id)
    .order('display_order', { ascending: true })

  const unitIds = (unitsData ?? []).map((u) => u.id)
  if (unitIds.length === 0) {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      grade_level: course.grade_level,
      subject: (course as any).subjects ?? null,
      published_lessons: 0,
      total_units: 0,
      units: [],
    }
  }

  const { data: lessonsData } = await sb
    .from('lessons')
    .select(
      'id, title, slug, display_order, difficulty_level, estimated_minutes, is_published, lesson_kind, unit_id'
    )
    .in('unit_id', unitIds)
    .eq('lesson_kind', 'main')
    .order('display_order', { ascending: true })

  const lessonsByUnit = new Map<string, PreviewLesson[]>()
  for (const l of (lessonsData ?? []) as Array<Omit<PreviewLesson, 'oa_code'>>) {
    const arr = lessonsByUnit.get(l.unit_id) ?? []
    arr.push({ ...l, oa_code: extractOaCode(l.slug) })
    lessonsByUnit.set(l.unit_id, arr)
  }

  const units: PreviewUnit[] = (unitsData ?? []).map((u) => ({
    id: u.id,
    title: u.title,
    slug: u.slug,
    display_order: u.display_order,
    course_id: u.course_id,
    lessons: lessonsByUnit.get(u.id) ?? [],
  }))

  // Mantenemos todas las unidades (incluso sin lecciones publicadas) para que
  // el lector vea el mapa completo del curso.
  const publishedLessons = units.reduce(
    (acc, u) => acc + u.lessons.filter((l) => l.is_published).length,
    0
  )

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    grade_level: course.grade_level,
    subject: (course as any).subjects ?? null,
    published_lessons: publishedLessons,
    total_units: units.length,
    units,
  }
}

export type LessonNeighbors = {
  course: { id: string; title: string; slug: string } | null
  unit: { id: string; title: string; slug: string } | null
  current: PreviewLesson | null
  prev: PreviewLesson | null
  next: PreviewLesson | null
  unitLessons: PreviewLesson[]
}

/**
 * Dado un OA code (ej. MA04-OA01) busca la lección main publicada y
 * calcula previa/siguiente recorriendo todas las lecciones del curso
 * ordenadas por unit.display_order y luego lesson.display_order.
 */
export async function getLessonNeighbors(oaCode: string): Promise<LessonNeighbors> {
  const sb = previewSupabase()

  // 1) Lección actual + unit + course.
  const { data: lesson } = await sb
    .from('lessons')
    .select(
      `id, title, slug, display_order, difficulty_level, estimated_minutes, is_published, lesson_kind, unit_id,
       units!inner(id, title, slug, display_order, course_id,
         courses!inner(id, title, slug))`
    )
    .ilike('slug', `${oaCode.toLowerCase()}%`)
    .eq('lesson_kind', 'main')
    .limit(1)
    .maybeSingle()

  if (!lesson) {
    return { course: null, unit: null, current: null, prev: null, next: null, unitLessons: [] }
  }

  const unit = (lesson as any).units
  const course = unit?.courses

  // 2) Todas las unidades del curso.
  const { data: unitsAll } = await sb
    .from('units')
    .select('id, title, slug, display_order, course_id')
    .eq('course_id', course.id)
    .order('display_order', { ascending: true })

  const unitIds = (unitsAll ?? []).map((u) => u.id)

  // 3) Todas las lecciones main publicadas del curso.
  const { data: lessonsAll } = await sb
    .from('lessons')
    .select(
      'id, title, slug, display_order, difficulty_level, estimated_minutes, is_published, lesson_kind, unit_id'
    )
    .in('unit_id', unitIds.length > 0 ? unitIds : [course.id]) // safety fallback
    .eq('lesson_kind', 'main')
    .eq('is_published', true)
    .order('display_order', { ascending: true })

  const unitOrder = new Map<string, number>()
  for (const u of unitsAll ?? []) unitOrder.set(u.id, u.display_order ?? 0)

  const ordered = (lessonsAll ?? [])
    .map((l) => ({
      ...l,
      oa_code: extractOaCode(l.slug),
    }))
    .sort((a, b) => {
      const ua = unitOrder.get(a.unit_id) ?? 999
      const ub = unitOrder.get(b.unit_id) ?? 999
      if (ua !== ub) return ua - ub
      return (a.display_order ?? 0) - (b.display_order ?? 0)
    })

  const idx = ordered.findIndex((l) => l.id === lesson.id)
  const current = idx >= 0 ? ordered[idx] : { ...(lesson as any), oa_code: extractOaCode(lesson.slug) }
  const prev = idx > 0 ? ordered[idx - 1] : null
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null

  const unitLessons = ordered.filter((l) => l.unit_id === lesson.unit_id)

  return {
    course: course ? { id: course.id, title: course.title, slug: course.slug } : null,
    unit: unit ? { id: unit.id, title: unit.title, slug: unit.slug } : null,
    current,
    prev,
    next,
    unitLessons,
  }
}

/** Devuelve estilos cálidos para badge de asignatura. */
export function subjectBadgeStyles(name?: string | null): { bg: string; text: string; ring: string } {
  const n = (name ?? '').toLowerCase()
  if (n.includes('matem')) return { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', ring: 'ring-[#BFDBFE]' }
  if (n.includes('lenguaje') || n.includes('lectura') || n.includes('lengua'))
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', ring: 'ring-[#FECACA]' }
  if (n.includes('cien') || n.includes('natura')) return { bg: 'bg-[#D1FAE5]', text: 'text-[#047857]', ring: 'ring-[#A7F3D0]' }
  if (n.includes('histo') || n.includes('social')) return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', ring: 'ring-[#FDE68A]' }
  if (n.includes('ingl')) return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', ring: 'ring-[#DDD6FE]' }
  return { bg: 'bg-[#F7F2E8]', text: 'text-[#5A4F47]', ring: 'ring-[#EFE7D5]' }
}

/** Formatea grade_level estilo "4_basico" → "4° Básico". */
export function formatGradeLevel(g: string): string {
  const m = g.match(/^(\d+)_(.+)$/)
  if (!m) return g
  const [, num, kind] = m
  const label = kind === 'basico' ? 'Básico' : kind === 'medio' ? 'Medio' : kind
  return `${num}° ${label}`
}
