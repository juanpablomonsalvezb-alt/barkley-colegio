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
  Image as ImageIcon,
  Network,
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
import MindMapViewer, { type MindMapNode } from './mind-map-viewer'
import SlidesViewer from './slides-viewer'
import InfographicModal from './infographic-modal'
import SectionNav, { type NavSection } from './section-nav'
import ShareButton from './share-button'
import { Markdown } from './markdown'

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
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 animate-ping rounded-full bg-[#F97316]/15" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#FFE4D1] text-3xl animate-float">
          🐶
        </div>
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

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, title, passing_score, time_limit_seconds, max_attempts, total_questions')
    .eq('lesson_id', lesson.id)
    .maybeSingle()

  let questions: Question[] = []
  if (quiz?.id) {
    const { data: qs } = await supabase
      .from('questions')
      .select('*')
      .eq('quiz_id', quiz.id)
      .order('display_order', { ascending: true })
    questions = (qs as unknown as Question[]) ?? []
  }

  const unit = (lesson as any).units
  const course = unit?.courses
  const subject = course?.subjects

  const audioUrl: string | null = unit?.audio_overview_url ?? null
  const audioDuration: number | null = unit?.audio_overview_duration_seconds ?? null
  const videoUrl: string | null = unit?.video_overview_url ?? null
  const slideUrl: string | null = unit?.slide_deck_url ?? null
  const infographicUrl: string | null = unit?.infographic_url ?? null
  // ---- Mind map: NotebookLM devuelve {name, children:[{name, children}]} (recursivo).
  //      Nuestro viewer espera {label, children}. Mapeamos name->label.
  function normalizeMindMap(raw: unknown): MindMapNode | null {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, any>
    // Si ya viene con label, asumimos formato correcto.
    const label = typeof r.label === 'string' ? r.label : typeof r.name === 'string' ? r.name : null
    if (!label) {
      // A veces viene envuelto como {root: {...}} o {tree: {...}}
      if (r.root) return normalizeMindMap(r.root)
      if (r.tree) return normalizeMindMap(r.tree)
      return null
    }
    const children = Array.isArray(r.children)
      ? (r.children.map(normalizeMindMap).filter(Boolean) as MindMapNode[])
      : []
    const description = typeof r.description === 'string' ? r.description : undefined
    return { label, description, children }
  }
  const mindMap: MindMapNode | null = normalizeMindMap(unit?.mind_map_json)

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

  const sections: NavSection[] = [
    { id: 'audio', label: 'Podcast', icon: '🎙️', available: !!audioUrl },
    { id: 'video', label: 'Video', icon: '🎬', available: !!videoUrl },
    { id: 'lesson', label: 'Lección', icon: '📖', available: !!lesson.content_html },
    { id: 'quiz', label: 'Quiz', icon: '📝', available: questions.length > 0 },
    { id: 'slides', label: 'Slides', icon: '🎴', available: !!slideUrl },
    { id: 'infographic', label: 'Infografía', icon: '🖼️', available: !!infographicUrl },
    { id: 'mindmap', label: 'Mapa mental', icon: '🕸️', available: !!mindMap },
    { id: 'flashcards', label: 'Flashcards', icon: '🧠', available: !!flashcards },
    { id: 'guide', label: 'Guía de estudio', icon: '📚', available: !!studyGuide },
    { id: 'reinforcement', label: 'Refuerzo', icon: '🔁', available: !!lesson.reinforcement_content_html },
    { id: 'challenge', label: 'Desafío', icon: '🚀', available: !!lesson.challenge_content_html },
  ]

  const subjBadge = subjectBadge(subject?.name)

  return (
    <div className="min-h-screen bg-[#FDFBF7] antialiased">
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

        {/* Doodle: el zorro Barkley en la esquina */}
        <div
          aria-hidden
          className="absolute top-6 right-6 md:top-10 md:right-10 text-5xl md:text-7xl select-none rotate-[8deg] animate-float opacity-90"
        >
          🦊
        </div>

        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-14 md:pt-16 md:pb-20">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-semibold text-[#C2410C] ring-1 ring-[#FFE4D1] shadow-sm">
              <span className="text-base">🐶</span> Barkley
            </div>
            {subject && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ring-1 ring-inset ${subjBadge.bg} ${subjBadge.text} ${subjBadge.ring}`}
              >
                {subject.name}
              </span>
            )}
            {course && (
              <span className="text-[13px] text-[#5A4F47]">
                {course.title}
              </span>
            )}
            <span className="ml-auto inline-flex items-center rounded-full bg-white px-2.5 py-1 font-mono text-[11px] tracking-wider text-[#5A4F47] ring-1 ring-[#EFE7D5] shadow-sm">
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

            {/* INFOGRAPHIC */}
            <SectionShell
              id="infographic"
              icon={ImageIcon}
              emoji="🖼️"
              eyebrow="Visual síntesis"
              title="Infografía"
              description="Un vistazo visual a todos los conceptos clave de la unidad en una sola imagen."
            >
              {infographicUrl ? (
                <InfographicModal src={infographicUrl} alt={unit?.title ?? 'Infografía'} />
              ) : (
                <EmptyState message="Infografía en generación…" />
              )}
            </SectionShell>

            {/* MIND MAP */}
            <SectionShell
              id="mindmap"
              icon={Network}
              emoji="🕸️"
              eyebrow="Estructura conceptual"
              title="Mapa mental"
              description="Explora cómo se conectan los conceptos de esta unidad. Haz click para expandir cada rama."
            >
              {mindMap ? <MindMapViewer root={mindMap} /> : <EmptyState message="Mapa mental en generación…" />}
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
          </main>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="mt-16 md:mt-24 border-t border-[#EFE7D5] pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFE4D1] text-xl ring-1 ring-[#FFCAB8]">
                🐶
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
