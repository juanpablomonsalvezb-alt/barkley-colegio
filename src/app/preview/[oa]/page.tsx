/**
 * Página pública de preview de una unidad Barkley.
 * URL: /preview/MA04-OA01
 *
 * Server Component que carga TODOS los artifacts disponibles (audio overview,
 * video, lección, quiz, slides, infografía, mapa mental, flashcards, guía de
 * estudio, refuerzo, desafío) y los presenta como una experiencia premium
 * inspirada en Vercel/Linear/Stripe.
 */
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import {
  BookOpen,
  Headphones,
  Video as VideoIcon,
  FileQuestion,
  Presentation,
  Layers,
  ScrollText,
  RefreshCcw,
  Rocket,
  Sparkles,
  Clock,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import AudioPlayer from './audio-player'
import QuizCarousel, { type QuizQuestion } from './quiz-carousel'
import VideoPlayer, { VideoPlaceholder } from './video-player'
import FlashcardsDeck from './flashcards-deck'
import SlidesViewer from './slides-viewer'
import SectionNav, { type NavSection } from './section-nav'
import ShareButton from './share-button'
import { Markdown } from './markdown'
import SubLessonsGrid, { type SubLesson } from './sub-lessons-grid'
import PracticeSetsList, { type PracticeSet } from './practice-sets-list'
import TopBar from '../top-bar'
import LessonNav from './lesson-nav'
import UnitLessonsRail from './unit-lessons-rail'
import { courseHref, getLessonNeighbors } from '@/lib/preview'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{ oa: string }>
}

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
  feedback_correct: string
  feedback_incorrect: string
  feedback_hint: string | null
  feedback_per_option: Record<string, string> | null
  difficulty_level: number
  points: number
  topic_tag: string | null
}

interface Flashcard {
  front: string
  back: string
}

// ---------- helpers ----------

function renderOption(opt: QuestionOption | string, idx: number) {
  const id = typeof opt === 'string' ? String.fromCharCode(97 + idx) : opt.id
  const text = typeof opt === 'string' ? opt : opt.text
  return { id, text }
}

function SectionShell({
  id,
  icon: Icon,
  emoji,
  eyebrow,
  title,
  description,
  action,
  tone,
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  eyebrow: string
  title: string
  description?: string
  action?: React.ReactNode
  tone?: keyof typeof SECTION_TONES
  children: React.ReactNode
}) {
  const t = SECTION_TONES[(tone ?? id) as keyof typeof SECTION_TONES] ?? SECTION_TONES.default

  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[28px] border border-[#EFE7D5] bg-white p-6 md:p-10 shadow-[0_1px_0_rgba(44,40,38,0.03),0_8px_24px_-12px_rgba(44,40,38,0.10)] transition hover:shadow-[0_2px_0_rgba(44,40,38,0.04),0_16px_40px_-16px_rgba(44,40,38,0.14)]"
    >
      <header className="mb-7 flex items-start gap-4 md:mb-9">
        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${t.bg} ring-1 ring-inset ${t.ring}`}
        >
          <Icon className={`h-6 w-6 ${t.icon}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] uppercase tracking-[0.18em] font-semibold ${t.eyebrow} flex items-center gap-1.5`}>
            <span className="text-sm leading-none">{emoji}</span>
            {eyebrow}
          </div>
          <h2 className="mt-1.5 font-heading text-[28px] md:text-[34px] font-semibold tracking-tight text-[#2C2826] leading-[1.15]">
            {title}
          </h2>
          {description && (
            <p className="mt-2 text-[15px] text-[#5A4F47] leading-relaxed max-w-2xl">{description}</p>
          )}
        </div>
        {action && <div className="hidden md:block">{action}</div>}
      </header>
      {children}
    </section>
  )
}

function EmptyState({ message = 'Estamos preparando esto…', hint = 'Vuelve en unos minutos' }: { message?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-dashed border-[#EFE7D5] bg-[#FDFBF7] px-6 py-14 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#F97316]/15" />
        <Sparkles className="relative h-6 w-6 text-[#F97316]" />
      </div>
      <div>
        <div className="text-base font-medium text-[#2C2826]">{message}</div>
        {hint && <div className="mt-1 text-sm text-[#8A7F75]">{hint}</div>}
      </div>
    </div>
  )
}

// Paleta de cada sección — color cálido, ningún morado tech.
const SECTION_TONES: Record<
  string,
  { bg: string; ring: string; icon: string; eyebrow: string; halo: string }
> = {
  audio:         { bg: 'bg-[#DBF1FF]', ring: 'ring-[#BFE6FF]', icon: 'text-[#0369A1]', eyebrow: 'text-[#0369A1]', halo: 'bg-[#0369A1]/10' },
  video:         { bg: 'bg-[#FFE0D6]', ring: 'ring-[#FFCAB8]', icon: 'text-[#C2410C]', eyebrow: 'text-[#C2410C]', halo: 'bg-[#C2410C]/10' },
  lesson:        { bg: 'bg-[#D1FAE5]', ring: 'ring-[#A7F3D0]', icon: 'text-[#047857]', eyebrow: 'text-[#047857]', halo: 'bg-[#047857]/10' },
  quiz:          { bg: 'bg-[#FEF3C7]', ring: 'ring-[#FDE68A]', icon: 'text-[#A16207]', eyebrow: 'text-[#A16207]', halo: 'bg-[#A16207]/10' },
  slides:        { bg: 'bg-[#FFE4D1]', ring: 'ring-[#FED7AA]', icon: 'text-[#C2410C]', eyebrow: 'text-[#C2410C]', halo: 'bg-[#C2410C]/10' },
  infographic:   { bg: 'bg-[#CFFAFE]', ring: 'ring-[#A5F3FC]', icon: 'text-[#0E7490]', eyebrow: 'text-[#0E7490]', halo: 'bg-[#0E7490]/10' },
  mindmap:       { bg: 'bg-[#EDE9FE]', ring: 'ring-[#DDD6FE]', icon: 'text-[#6D28D9]', eyebrow: 'text-[#6D28D9]', halo: 'bg-[#6D28D9]/10' },
  flashcards:    { bg: 'bg-[#FCE7F3]', ring: 'ring-[#FBCFE8]', icon: 'text-[#BE185D]', eyebrow: 'text-[#BE185D]', halo: 'bg-[#BE185D]/10' },
  guide:         { bg: 'bg-[#F5E6D3]', ring: 'ring-[#EAD2B0]', icon: 'text-[#92400E]', eyebrow: 'text-[#92400E]', halo: 'bg-[#92400E]/10' },
  reinforcement: { bg: 'bg-[#FFE0D6]', ring: 'ring-[#FFCAB8]', icon: 'text-[#C2410C]', eyebrow: 'text-[#C2410C]', halo: 'bg-[#C2410C]/10' },
  challenge:     { bg: 'bg-[#D1FAE5]', ring: 'ring-[#A7F3D0]', icon: 'text-[#047857]', eyebrow: 'text-[#047857]', halo: 'bg-[#047857]/10' },
  subtemas:      { bg: 'bg-[#D1FAE5]', ring: 'ring-[#A7F3D0]', icon: 'text-[#047857]', eyebrow: 'text-[#047857]', halo: 'bg-[#047857]/10' },
  practica:      { bg: 'bg-[#FEF3C7]', ring: 'ring-[#FDE68A]', icon: 'text-[#A16207]', eyebrow: 'text-[#A16207]', halo: 'bg-[#A16207]/10' },
  default:       { bg: 'bg-[#F7F2E8]', ring: 'ring-[#EFE7D5]', icon: 'text-[#5A4F47]', eyebrow: 'text-[#8A7F75]', halo: 'bg-[#5A4F47]/10' },
}

function subjectBadge(name?: string): { bg: string; text: string; ring: string } {
  const n = (name ?? '').toLowerCase()
  if (n.includes('matem')) return { bg: 'bg-[#DBEAFE]', text: 'text-[#1D4ED8]', ring: 'ring-[#BFDBFE]' }
  if (n.includes('lenguaje') || n.includes('lectura') || n.includes('lengua'))
    return { bg: 'bg-[#FEE2E2]', text: 'text-[#B91C1C]', ring: 'ring-[#FECACA]' }
  if (n.includes('cien') || n.includes('natura')) return { bg: 'bg-[#D1FAE5]', text: 'text-[#047857]', ring: 'ring-[#A7F3D0]' }
  if (n.includes('histo') || n.includes('social')) return { bg: 'bg-[#FEF3C7]', text: 'text-[#B45309]', ring: 'ring-[#FDE68A]' }
  if (n.includes('ingl')) return { bg: 'bg-[#EDE9FE]', text: 'text-[#6D28D9]', ring: 'ring-[#DDD6FE]' }
  return { bg: 'bg-[#F7F2E8]', text: 'text-[#5A4F47]', ring: 'ring-[#EFE7D5]' }
}

// ---------- Page ----------

export default async function PreviewPage({ params }: PageProps) {
  const { oa: oaCode } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: lesson } = await supabase
    .from('lessons')
    .select(
      `id, title, content_html, estimated_minutes, difficulty_level,
       reinforcement_content_html, challenge_content_html, challenge_project_description,
       unit_id,
       units(id, title,
             audio_overview_url, audio_overview_status, audio_overview_duration_seconds,
             video_overview_url, slide_deck_url, infographic_url,
             mind_map_json, flashcards_json, study_guide_md,
             courses(id, title, grade_level, subjects(name, color, icon_url)))`
    )
    .ilike('slug', `${oaCode.toLowerCase()}%`)
    .limit(1)
    .maybeSingle()

  if (!lesson) notFound()

  // Traer TODOS los quizzes de esta lección (formal + practice_*).
  const { data: allQuizzes } = await supabase
    .from('quizzes')
    .select('id, title, passing_score, time_limit_seconds, max_attempts, total_questions, quiz_kind, display_order')
    .eq('lesson_id', lesson.id)
    .order('display_order', { ascending: true })

  const quizzesAll = (allQuizzes ?? []) as Array<{
    id: string
    title: string | null
    passing_score: number | null
    time_limit_seconds: number | null
    max_attempts: number | null
    total_questions: number | null
    quiz_kind: string | null
    display_order: number | null
  }>

  // Quiz formal (el que ya se muestra en la sección Quiz). Si no hay quiz_kind,
  // tomamos el primero (compatibilidad hacia atrás).
  const quiz =
    quizzesAll.find((q) => q.quiz_kind === 'formal' || q.quiz_kind == null) ?? null
  // Sets de práctica adicional: cualquier quiz que NO sea formal.
  const practiceQuizzes = quizzesAll.filter(
    (q) => q.quiz_kind != null && q.quiz_kind !== 'formal'
  )

  // Preguntas del quiz formal.
  let questions: Question[] = []
  if (quiz?.id) {
    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('display_order', { ascending: true })
    questions = (qs as unknown as Question[]) ?? []
  }

  // Preguntas de TODOS los practice sets, en un solo round-trip.
  const practiceIds = practiceQuizzes.map((q) => q.id)
  let practiceQuestionsByQuiz: Record<string, Question[]> = {}
  if (practiceIds.length > 0) {
    const { data: pqs } = await supabase
      .from('questions')
      .select('*')
      .in('quiz_id', practiceIds)
      .order('display_order', { ascending: true })
    for (const q of (pqs ?? []) as unknown as (Question & { quiz_id: string })[]) {
      ;(practiceQuestionsByQuiz[q.quiz_id] ||= []).push(q)
    }
  }

  // Sub-lecciones (lessons hijas de la lección actual).
  const { data: subRaw } = await supabase
    .from('lessons')
    .select('id, title, content_html, estimated_minutes, difficulty_level, display_order, lesson_kind, parent_lesson_id')
    .eq('parent_lesson_id', lesson.id)
    .eq('lesson_kind', 'sub')
    .order('display_order', { ascending: true })

  const subLessons: SubLesson[] = ((subRaw ?? []) as Array<{
    id: string
    title: string
    content_html: string | null
    estimated_minutes: number | null
    difficulty_level: number | null
    display_order: number | null
  }>).map((s) => ({
    id: s.id,
    title: s.title,
    content_html: s.content_html,
    estimated_minutes: s.estimated_minutes,
    difficulty_level: s.difficulty_level,
    display_order: s.display_order,
  }))

  // Normaliza opciones de una pregunta al formato que espera QuizCarousel.
  function toCarouselQuestion(q: Question): QuizQuestion {
    return {
      ...q,
      options: Array.isArray(q.options)
        ? q.options.map((o, i) => renderOption(o, i))
        : Object.entries((q.options as Record<string, string>) ?? {}).map(([id, text]) => ({
            id,
            text,
          })),
    } as QuizQuestion
  }

  const practiceSets: PracticeSet[] = practiceQuizzes.map((pq) => ({
    id: pq.id,
    title: pq.title ?? 'Set de práctica',
    quiz_kind: pq.quiz_kind ?? 'practice',
    total_questions: pq.total_questions,
    time_limit_seconds: pq.time_limit_seconds,
    questions: (practiceQuestionsByQuiz[pq.id] ?? []).map(toCarouselQuestion),
  }))

  const unit = (lesson as any).units
  const course = unit?.courses
  const subject = course?.subjects

  const audioUrl: string | null = unit?.audio_overview_url ?? null
  const audioDuration: number | null = unit?.audio_overview_duration_seconds ?? null
  const videoUrl: string | null = unit?.video_overview_url ?? null
  const slideUrl: string | null = unit?.slide_deck_url ?? null
  const infographicUrl: string | null = unit?.infographic_url ?? null
  // ---- Flashcards: NotebookLM devuelve {cards: [{front, back}]} pero a veces
  //      llega como array directo o {flashcards: [...]}. Normalizamos.
  function normalizeFlashcards(raw: unknown): Flashcard[] | null {
    if (!raw) return null
    let arr: any[] | null = null
    if (Array.isArray(raw)) arr = raw
    else if (typeof raw === 'object') {
      const r = raw as Record<string, any>
      if (Array.isArray(r.cards)) arr = r.cards
      else if (Array.isArray(r.flashcards)) arr = r.flashcards
      else if (Array.isArray(r.items)) arr = r.items
    }
    if (!arr) return null
    const cleaned = arr
      .map((c) => {
        if (!c || typeof c !== 'object') return null
        const front = c.front ?? c.question ?? c.term ?? c.q
        const back = c.back ?? c.answer ?? c.definition ?? c.a
        if (typeof front !== 'string' || typeof back !== 'string') return null
        return { front, back } as Flashcard
      })
      .filter(Boolean) as Flashcard[]
    return cleaned.length ? cleaned : null
  }
  const flashcards: Flashcard[] | null = normalizeFlashcards(unit?.flashcards_json)
  const studyGuide: string | null = unit?.study_guide_md ?? null

  const passingScore = quiz?.passing_score ?? 60
  const timeMin = quiz?.time_limit_seconds ? Math.ceil(quiz.time_limit_seconds / 60) : null

  // Navegación global del curso: vecinos prev/next + otras lecciones de la unidad.
  const neighbors = await getLessonNeighbors(oaCode)

  const sections: NavSection[] = [
    { id: 'audio', label: 'Podcast', icon: '🎙️', available: !!audioUrl },
    { id: 'video', label: 'Video', icon: '🎬', available: !!videoUrl },
    { id: 'lesson', label: 'Lección', icon: '📖', available: !!lesson.content_html },
    { id: 'subtemas', label: 'Sub-temas', icon: '🎯', available: subLessons.length > 0 },
    { id: 'quiz', label: 'Quiz', icon: '📝', available: questions.length > 0 },
    { id: 'practica', label: 'Práctica extra', icon: '💪', available: practiceSets.length > 0 },
    { id: 'worksheet', label: 'Imprimir', icon: '🖨️', available: questions.length > 0 },
    { id: 'slides', label: 'Slides', icon: '🎴', available: !!slideUrl },
    { id: 'flashcards', label: 'Flashcards', icon: '🧠', available: !!flashcards },
    { id: 'guide', label: 'Guía de estudio', icon: '📚', available: !!studyGuide },
    { id: 'reinforcement', label: 'Refuerzo', icon: '🔁', available: !!lesson.reinforcement_content_html },
    { id: 'challenge', label: 'Desafío', icon: '🚀', available: !!lesson.challenge_content_html },
  ]

  const subjBadge = subjectBadge(subject?.name)

  return (
    <div className="min-h-screen bg-[#FDFBF7] antialiased">
      <TopBar
        course={course ? { title: course.title, slug: course.slug } : null}
        lessonTitle={lesson.title}
        rightSlot={<ShareButton />}
      />
      {/* ============ HERO ============ */}
      <header className="relative overflow-hidden border-b border-[#EFE7D5] bg-paper-grain bg-[#FDFBF7]">
        {/* Líneas rayadas tipo cuaderno escolar (sutil) */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.35] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, transparent 31px, rgba(180, 160, 130, 0.18) 31px, rgba(180, 160, 130, 0.18) 32px, transparent 32px)',
            backgroundSize: '100% 32px',
          }}
        />
        {/* Halos cálidos */}
        <div
          aria-hidden
          className="absolute -top-40 -left-20 h-[480px] w-[480px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FFE4D1 0%, transparent 70%)' }}
        />
        <div
          aria-hidden
          className="absolute -bottom-32 -right-20 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
          style={{ background: 'radial-gradient(circle, #FEF3C7 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-14 md:pt-16 md:pb-20">
          {/* Breadcrumb clickable */}
          <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
            <Link
              href="/preview"
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-[#C2410C] shadow-sm ring-1 ring-[#FFE4D1] transition hover:bg-[#FFE4D1]/60"
            >
              Barkley
            </Link>
            {subject && (
              <Link
                href="/preview"
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-inset transition hover:opacity-90 ${subjBadge.bg} ${subjBadge.text} ${subjBadge.ring}`}
              >
                {subject.name}
              </Link>
            )}
            {course && (
              <Link
                href={courseHref(course.slug)}
                className="text-[13px] font-medium text-[#5A4F47] underline decoration-[#D4C7B5] underline-offset-4 transition hover:text-[#C2410C] hover:decoration-[#F97316]"
              >
                {course.title}
              </Link>
            )}
            <span className="ml-auto inline-flex items-center rounded-full bg-white px-2.5 py-1 font-mono text-[11px] tracking-wider text-[#5A4F47] shadow-sm ring-1 ring-[#EFE7D5]">
              {oaCode.toUpperCase()}
            </span>
          </div>

          {/* Title — Fraunces serif amigable */}
          <h1 className="mt-7 max-w-4xl font-heading text-[44px] md:text-[68px] font-semibold tracking-tight leading-[1.02] text-[#2C2826]">
            <span className="barkley-underline">{lesson.title}</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-2xl text-[17px] md:text-[19px] text-[#5A4F47] leading-relaxed">
            Una unidad para aprender a tu ritmo: podcast, video, lección, quiz y
            materiales de estudio hechos para entender de verdad.
          </p>

          {/* Meta cards */}
          <div className="mt-8 flex flex-wrap items-stretch gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C2826] ring-1 ring-[#EFE7D5] shadow-[0_1px_0_rgba(44,40,38,0.04),0_4px_12px_-6px_rgba(44,40,38,0.10)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#DBF1FF]">
                <Clock className="h-4 w-4 text-[#0369A1]" />
              </span>
              <span>
                <span className="font-semibold">{lesson.estimated_minutes ?? 15}</span>
                <span className="text-[#8A7F75]"> min</span>
              </span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C2826] ring-1 ring-[#EFE7D5] shadow-[0_1px_0_rgba(44,40,38,0.04),0_4px_12px_-6px_rgba(44,40,38,0.10)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF3C7]">
                <Zap className="h-4 w-4 text-[#A16207]" />
              </span>
              <span>
                <span className="font-semibold">Nivel {lesson.difficulty_level ?? 2}</span>
                <span className="text-[#8A7F75]">/5</span>
              </span>
            </div>
            {quiz && (
              <div className="inline-flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-sm font-medium text-[#2C2826] ring-1 ring-[#EFE7D5] shadow-[0_1px_0_rgba(44,40,38,0.04),0_4px_12px_-6px_rgba(44,40,38,0.10)]">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FEF3C7]">
                  <FileQuestion className="h-4 w-4 text-[#A16207]" />
                </span>
                <span>
                  <span className="font-semibold">{questions.length}</span>
                  <span className="text-[#8A7F75]"> preguntas</span>
                </span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-2xl bg-[#D1FAE5] px-3.5 py-2.5 text-sm font-semibold text-[#047857] ring-1 ring-[#A7F3D0]">
              <Sparkles className="h-4 w-4" />
              Preview gratuito
            </div>
          </div>
        </div>
      </header>

      {/* ============ MAIN ============ */}
      <div className="mx-auto max-w-6xl px-4 md:px-8 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 md:gap-12">
          {/* Sidebar */}
          <aside>
            {neighbors.unit && neighbors.current && (
              <UnitLessonsRail
                currentId={neighbors.current.id}
                unitTitle={neighbors.unit.title}
                lessons={neighbors.unitLessons}
              />
            )}
            <SectionNav sections={sections} />
          </aside>

          {/* Sections */}
          <main className="space-y-8 md:space-y-10 min-w-0">
            {/* AUDIO */}
            <SectionShell
              id="audio"
              icon={Headphones}
              emoji="🎙️"
              eyebrow="Audio overview"
              title="Podcast de la unidad"
              description="Escucha un resumen conversacional generado con IA, perfecto para aprender en el camino al colegio."
            >
              {audioUrl ? (
                <AudioPlayer
                  src={audioUrl}
                  title={unit?.title ?? 'Podcast de la unidad'}
                  subtitle={`${subject?.name ?? ''} · ${course?.title ?? ''}`}
                  durationSeconds={audioDuration}
                />
              ) : (
                <EmptyState message="Podcast en generación…" hint="Vuelve en unos minutos para escucharlo." />
              )}
            </SectionShell>

            {/* VIDEO */}
            <SectionShell
              id="video"
              icon={VideoIcon}
              emoji="🎬"
              eyebrow="Video overview"
              title="Video explicativo"
              description="Explicación visual de los conceptos clave de la unidad."
            >
              {videoUrl ? <VideoPlayer src={videoUrl} /> : <VideoPlaceholder />}
            </SectionShell>

            {/* LESSON */}
            <SectionShell
              id="lesson"
              icon={BookOpen}
              emoji="📖"
              eyebrow="Contenido principal"
              title="Lección"
              description="Material de estudio detallado con explicaciones, ejemplos y ejercicios resueltos."
            >
              {lesson.content_html ? (
                <article
                  className="prose prose-lg max-w-[68ch] prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-semibold prose-headings:text-[#2C2826] prose-h1:text-4xl prose-h2:text-[28px] prose-h2:mt-10 prose-h3:text-xl prose-p:text-[#3F3833] prose-p:leading-[1.75] prose-strong:text-[#2C2826] prose-a:text-[#C2410C] prose-a:no-underline hover:prose-a:underline prose-code:rounded-md prose-code:bg-[#FEF3C7] prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:text-[#A16207] prose-code:before:hidden prose-code:after:hidden prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-[#F97316] prose-blockquote:bg-[#FFE4D1]/40 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-2xl prose-blockquote:font-normal prose-blockquote:text-[#3F3833] prose-li:text-[#3F3833] prose-img:rounded-2xl prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: lesson.content_html }}
                />
              ) : (
                <EmptyState message="Lección en generación…" />
              )}
            </SectionShell>

            {/* SUB-LECCIONES */}
            {subLessons.length > 0 && (
              <SectionShell
                id="subtemas"
                icon={Layers}
                emoji="🎯"
                eyebrow="Profundización por sub-temas"
                title="Sub-temas profundizadores"
                description="Mini-lecciones para profundizar uno a uno los conceptos clave del OA. Abre la card para leer."
                tone="subtemas"
              >
                <SubLessonsGrid subLessons={subLessons} />
              </SectionShell>
            )}

            {/* QUIZ */}
            <SectionShell
              id="quiz"
              icon={FileQuestion}
              emoji="📝"
              eyebrow="Evaluación"
              title={quiz?.title ?? 'Quiz de práctica'}
              description={`${questions.length} preguntas · Aprueba con ${passingScore}%${timeMin ? ` · ${timeMin} min` : ''}`}
              action={
                <Badge variant="secondary" className="gap-1.5 bg-[#FEF3C7] text-[#A16207] hover:bg-[#FDE68A] ring-1 ring-[#FDE68A]">
                  <Sparkles className="h-3 w-3" />
                  Respuestas visibles
                </Badge>
              }
            >
              {questions.length === 0 ? (
                <EmptyState message="Quiz en generación…" />
              ) : (
                <QuizCarousel
                  questions={questions.map((q) => ({
                    ...q,
                    options: Array.isArray(q.options)
                      ? q.options.map((o, i) => renderOption(o, i))
                      : Object.entries((q.options as Record<string, string>) ?? {}).map(([id, text]) => ({
                          id,
                          text,
                        })),
                  })) as QuizQuestion[]}
                />
              )}
            </SectionShell>

            {/* PRACTICE SETS ADICIONALES */}
            {practiceSets.length > 0 && (
              <SectionShell
                id="practica"
                icon={Zap}
                emoji="💪"
                eyebrow="Práctica extra · niveles fácil / medio / difícil"
                title="Sets de práctica adicional"
                description="Más preguntas de práctica organizadas por dificultad. Ideal para repasar después del quiz formal o para entrenar antes de un examen."
                tone="practica"
              >
                <PracticeSetsList sets={practiceSets} />
              </SectionShell>
            )}

            {/* PRINT WORKSHEET — solo botones, las hojas son URLs separadas */}
            <SectionShell
              id="worksheet"
              icon={FileQuestion}
              emoji="🖨️"
              eyebrow="Material descargable"
              title="Ejercicios para imprimir"
              description="Hojas listas para imprimir o guardar como PDF. Una para el alumno, otra con el solucionario para el profesor o apoderado."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a
                  href={`/preview/${oaCode.toLowerCase()}/imprimir`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border-2 border-[#FFE4D1] bg-white p-6 hover:border-[#F97316] hover:bg-[#FFF7ED] transition shadow-sm hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFE4D1] text-2xl">
                    📄
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#2C2826]">Hoja del alumno</h3>
                    <p className="mt-1 text-sm text-[#5A4F47]">
                      {questions.length} ejercicios con espacio para responder. Sin respuestas visibles.
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#C2410C] group-hover:gap-3 transition-all">
                    Abrir e imprimir →
                  </span>
                </a>

                <a
                  href={`/preview/${oaCode.toLowerCase()}/solucionario`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border-2 border-[#D1FAE5] bg-white p-6 hover:border-[#10B981] hover:bg-[#F0FDF4] transition shadow-sm hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D1FAE5] text-2xl">
                    🔑
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#2C2826]">Solucionario</h3>
                    <p className="mt-1 text-sm text-[#5A4F47]">
                      Mismos {questions.length} ejercicios con respuestas correctas y explicaciones para el profesor o apoderado.
                    </p>
                  </div>
                  <span className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#047857] group-hover:gap-3 transition-all">
                    Abrir solucionario →
                  </span>
                </a>
              </div>
              <p className="mt-4 text-xs text-[#8A7F75]">
                💡 En el navegador presiona <kbd className="rounded bg-[#FDFBF7] px-1.5 py-0.5 border border-[#EFE7D5] font-mono">Ctrl+P</kbd>{' '}
                (Windows) o <kbd className="rounded bg-[#FDFBF7] px-1.5 py-0.5 border border-[#EFE7D5] font-mono">⌘P</kbd>{' '}
                (Mac) para imprimir o guardar como PDF.
              </p>
            </SectionShell>

            {/* SLIDES */}
            <SectionShell
              id="slides"
              icon={Presentation}
              emoji="🎴"
              eyebrow="Presentación"
              title="Slides de la unidad"
              description="Presentación lista para usar en clase o para repasar de forma visual."
            >
              {slideUrl ? <SlidesViewer url={slideUrl} /> : <EmptyState message="Slides en generación…" />}
            </SectionShell>

            {/* FLASHCARDS */}
            <SectionShell
              id="flashcards"
              icon={Layers}
              emoji="🧠"
              eyebrow="Repaso activo"
              title="Flashcards"
              description="Tarjetas de repaso para memorizar conceptos clave con repetición espaciada."
            >
              {flashcards && flashcards.length > 0 ? (
                <FlashcardsDeck cards={flashcards} />
              ) : (
                <EmptyState message="Flashcards en generación…" />
              )}
            </SectionShell>

            {/* STUDY GUIDE */}
            <SectionShell
              id="guide"
              icon={ScrollText}
              emoji="📚"
              eyebrow="Material de apoyo"
              title="Guía de estudio"
              description="Resumen estructurado para revisar antes de un examen o evaluación."
            >
              {studyGuide ? <Markdown content={studyGuide} /> : <EmptyState message="Guía de estudio en generación…" />}
            </SectionShell>

            {/* REINFORCEMENT */}
            {lesson.reinforcement_content_html && (
              <SectionShell
                id="reinforcement"
                icon={RefreshCcw}
                emoji="🔁"
                eyebrow="Ruta adaptativa · < 60%"
                title="Refuerzo"
                description="Contenido alternativo simplificado para quien necesita reforzar antes de avanzar."
                tone="reinforcement"
              >
                <article
                  className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-semibold prose-headings:text-[#2C2826] prose-h2:text-2xl prose-p:text-[#3F3833] prose-p:leading-relaxed prose-strong:text-[#2C2826] prose-a:text-[#C2410C]"
                  dangerouslySetInnerHTML={{ __html: lesson.reinforcement_content_html }}
                />
              </SectionShell>
            )}

            {/* CHALLENGE */}
            {lesson.challenge_content_html && (
              <SectionShell
                id="challenge"
                icon={Rocket}
                emoji="🚀"
                eyebrow="Ruta adaptativa · > 85%"
                title="Desafío"
                description="Contenido avanzado para quienes ya dominan el OA y buscan ir más lejos."
                tone="challenge"
              >
                <article
                  className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:tracking-tight prose-headings:font-semibold prose-headings:text-[#2C2826] prose-h2:text-2xl prose-p:text-[#3F3833] prose-p:leading-relaxed prose-strong:text-[#2C2826] prose-a:text-[#047857]"
                  dangerouslySetInnerHTML={{ __html: lesson.challenge_content_html }}
                />
                {lesson.challenge_project_description && (
                  <div className="mt-6 rounded-3xl border border-[#A7F3D0] bg-[#F0FDF4] p-5">
                    <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#047857] mb-2 flex items-center gap-1.5">
                      <span>📐</span> Proyecto práctico
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-[15px] text-[#2C2826] leading-relaxed">
                      {lesson.challenge_project_description}
                    </pre>
                  </div>
                )}
              </SectionShell>
            )}

            {/* PREV / NEXT */}
            <LessonNav prev={neighbors.prev} next={neighbors.next} />

            {/* Volver al curso */}
            {course && (
              <div className="mt-8 flex justify-center print:hidden">
                <Link
                  href={courseHref(course.slug)}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#5A4F47] shadow-sm ring-1 ring-[#EFE7D5] transition hover:bg-[#F7F2E8] hover:text-[#C2410C]"
                >
                  ← Volver a {course.title}
                </Link>
              </div>
            )}
          </main>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="mt-16 md:mt-24 border-t border-[#EFE7D5] pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE4D1] text-sm font-bold text-[#C2410C] ring-1 ring-[#FFCAB8]">
                B
              </div>
              <div>
                <div className="font-heading text-base font-semibold text-[#2C2826]">Barkley</div>
                <div className="text-[13px] text-[#8A7F75]">Preparación para Exámenes Libres MINEDUC</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton />
            </div>
          </div>
          <Separator className="my-6 bg-[#EFE7D5]" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-[12px] text-[#8A7F75]">
            <div>
              Preview público · Lección <span className="font-mono">{lesson.id.slice(0, 8)}</span> · OA{' '}
              <span className="font-mono">{oaCode.toUpperCase()}</span>
            </div>
            <div>Hecho con cariño en Chile · Curado por equipo pedagógico</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
