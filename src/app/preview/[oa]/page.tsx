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
  CheckCircle2,
  Lightbulb,
  XCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import AudioPlayer from './audio-player'
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
  tone = 'default',
  children,
}: {
  id: string
  icon: React.ComponentType<{ className?: string }>
  emoji: string
  eyebrow: string
  title: string
  description?: string
  action?: React.ReactNode
  tone?: 'default' | 'amber' | 'purple'
  children: React.ReactNode
}) {
  const toneClasses =
    tone === 'amber'
      ? 'border-amber-200/70 bg-gradient-to-b from-amber-50/40 to-white'
      : tone === 'purple'
        ? 'border-purple-200/70 bg-gradient-to-b from-purple-50/40 to-white'
        : 'border-slate-200 bg-white'

  const iconBg =
    tone === 'amber'
      ? 'bg-amber-100 text-amber-700'
      : tone === 'purple'
        ? 'bg-purple-100 text-purple-700'
        : 'bg-slate-100 text-slate-700'

  return (
    <section id={id} className={`scroll-mt-24 rounded-3xl border ${toneClasses} p-6 md:p-10 shadow-[0_1px_2px_rgba(15,23,42,0.04)]`}>
      <header className="mb-6 flex items-start gap-4 md:mb-8">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
            <span className="mr-1.5">{emoji}</span>
            {eyebrow}
          </div>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
          {description && <p className="mt-1.5 text-sm text-slate-500 leading-relaxed max-w-2xl">{description}</p>}
        </div>
        {action && <div className="hidden md:block">{action}</div>}
      </header>
      {children}
    </section>
  )
}

function EmptyState({ message = 'Generándose…', hint }: { message?: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-12 text-center">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <div className="absolute h-10 w-10 animate-ping rounded-full bg-slate-300/40" />
        <Sparkles className="relative h-5 w-5 text-slate-400" />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-600">{message}</div>
        {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
      </div>
    </div>
  )
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
  const mindMap: MindMapNode | null = unit?.mind_map_json ?? null
  const flashcards: Flashcard[] | null = unit?.flashcards_json ?? null
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

  return (
    <div className="min-h-screen bg-slate-50/50 antialiased">
      {/* ============ HERO ============ */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-slate-900 text-white">
        {/* Decorative grid + gradient */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="absolute -top-32 left-1/3 h-[420px] w-[420px] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(99 102 241) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-40 right-1/4 h-[420px] w-[420px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgb(168 85 247) 0%, transparent 70%)' }}
        />

        <div className="relative mx-auto max-w-6xl px-4 md:px-8 pt-10 pb-12 md:pt-16 md:pb-20">
          {/* Top bar */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="text-base">🐶</span> Barkley
            </div>
            <span className="text-slate-600">/</span>
            {subject && (
              <>
                <span>{subject.name}</span>
                <span className="text-slate-600">/</span>
              </>
            )}
            {course && (
              <>
                <span>{course.title}</span>
                <span className="text-slate-600">/</span>
              </>
            )}
            <span className="text-slate-200">{unit?.title}</span>
            <span className="ml-auto rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] tracking-wider text-slate-300 backdrop-blur">
              {oaCode.toUpperCase()}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-6 max-w-4xl text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
            {lesson.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-300 leading-relaxed">
            Unidad interactiva de aprendizaje con podcast, video, lección, quiz y materiales de estudio generados con
            IA para Exámenes Libres MINEDUC.
          </p>

          {/* Meta pills */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {lesson.estimated_minutes ?? 15} min
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              {'⚡'.repeat(lesson.difficulty_level ?? 2)}
              <span className="text-slate-400">Dificultad {lesson.difficulty_level ?? 2}/5</span>
            </div>
            {quiz && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 backdrop-blur">
                <FileQuestion className="h-3.5 w-3.5 text-slate-400" />
                {questions.length} preguntas
              </div>
            )}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Preview público
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
                  className="prose prose-lg prose-slate max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-10 prose-h3:text-xl prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900 prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[0.875em] prose-code:before:hidden prose-code:after:hidden prose-blockquote:not-italic prose-blockquote:border-l-4 prose-blockquote:border-indigo-500 prose-blockquote:bg-indigo-50/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:font-normal prose-blockquote:text-slate-700 prose-li:text-slate-700 prose-img:rounded-xl prose-img:shadow-sm"
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
                <Badge variant="secondary" className="gap-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
                  <Sparkles className="h-3 w-3" />
                  Modo preview · respuestas visibles
                </Badge>
              }
            >
              {questions.length === 0 ? (
                <EmptyState message="Quiz en generación…" />
              ) : (
                <div className="space-y-4">
                  {questions.map((q, idx) => {
                    const opts = Array.isArray(q.options)
                      ? q.options.map((o, i) => renderOption(o, i))
                      : Object.entries((q.options as Record<string, string>) ?? {}).map(([id, text]) => ({ id, text }))
                    const correct = q.correct_answer
                    const isCorrect = (id: string) =>
                      Array.isArray(correct) ? correct.includes(id) : correct === id
                    const noOpts = opts.length === 0 || q.question_type === 'completar' || q.question_type === 'ordenar'

                    return (
                      <div
                        key={q.id}
                        className="group rounded-2xl border border-slate-200 bg-white p-5 md:p-6 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-mono font-semibold text-white tabular-nums">
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 leading-snug text-base">{q.question_text}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                              <Badge variant="outline" className="font-mono uppercase tracking-wider text-slate-500">
                                {q.question_type}
                              </Badge>
                              <Badge variant="outline" className="text-slate-500">
                                {'⚡'.repeat(q.difficulty_level)}
                              </Badge>
                              {q.topic_tag && (
                                <Badge variant="outline" className="text-slate-500">
                                  {q.topic_tag}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-slate-500">
                                {q.points} pts
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {!noOpts && opts.length > 0 && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                            {opts.map((opt) => {
                              const ok = isCorrect(opt.id)
                              return (
                                <div
                                  key={opt.id}
                                  className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                    ok
                                      ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                                      : 'border-slate-200 bg-slate-50/50 text-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-mono font-bold ${
                                      ok ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'
                                    }`}
                                  >
                                    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : opt.id.toUpperCase()}
                                  </span>
                                  <span className={ok ? 'font-medium' : ''}>{opt.text}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {noOpts && (
                          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
                            <span className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                              Respuesta correcta
                            </span>
                            <div className="mt-1 font-mono text-emerald-900">
                              {typeof correct === 'string' ? correct : JSON.stringify(correct)}
                            </div>
                          </div>
                        )}

                        <details className="group/det mt-4 rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                          <summary className="cursor-pointer list-none px-4 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider">Ver feedback pedagógico</span>
                            <span className="ml-auto text-slate-400 group-open/det:rotate-90 transition-transform">›</span>
                          </summary>
                          <div className="border-t border-slate-200 bg-white px-4 py-3 space-y-3 text-sm">
                            <div className="flex gap-2.5">
                              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                              <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">Si responde correcto</div>
                                <div className="text-slate-700">{q.feedback_correct}</div>
                              </div>
                            </div>
                            <div className="flex gap-2.5">
                              <XCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                              <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-rose-700">Si responde incorrecto</div>
                                <div className="text-slate-700">{q.feedback_incorrect}</div>
                              </div>
                            </div>
                            {q.feedback_hint && (
                              <div className="flex gap-2.5">
                                <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider font-semibold text-amber-700">Pista</div>
                                  <div className="text-slate-700">{q.feedback_hint}</div>
                                </div>
                              </div>
                            )}
                            {q.feedback_per_option && Object.keys(q.feedback_per_option).length > 0 && (
                              <div>
                                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mb-1.5">Feedback por opción</div>
                                <ul className="space-y-1.5">
                                  {Object.entries(q.feedback_per_option).map(([id, txt]) => (
                                    <li key={id} className="flex gap-2 text-slate-700">
                                      <span className="font-mono text-xs text-slate-400 mt-0.5">{id})</span>
                                      <span>{txt}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>
                      </div>
                    )
                  })}
                </div>
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
                tone="amber"
              >
                <article
                  className="prose prose-lg prose-slate max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-h2:text-2xl prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900"
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
                tone="purple"
              >
                <article
                  className="prose prose-lg prose-slate max-w-none prose-headings:tracking-tight prose-headings:font-bold prose-h2:text-2xl prose-p:text-slate-700 prose-p:leading-relaxed prose-strong:text-slate-900"
                  dangerouslySetInnerHTML={{ __html: lesson.challenge_content_html }}
                />
                {lesson.challenge_project_description && (
                  <div className="mt-6 rounded-2xl border border-purple-200 bg-white p-5">
                    <div className="text-[10px] uppercase tracking-widest font-semibold text-purple-600 mb-2">
                      📐 Proyecto práctico
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed">
                      {lesson.challenge_project_description}
                    </pre>
                  </div>
                )}
              </SectionShell>
            )}
          </main>
        </div>

        {/* ============ FOOTER ============ */}
        <footer className="mt-16 md:mt-24 border-t border-slate-200 pt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-lg">🐶</div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Barkley</div>
                <div className="text-xs text-slate-500">Preparación para Exámenes Libres MINEDUC</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShareButton />
            </div>
          </div>
          <Separator className="my-6" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-slate-400">
            <div>
              Preview público · Lección <span className="font-mono">{lesson.id.slice(0, 8)}</span> · OA{' '}
              <span className="font-mono">{oaCode.toUpperCase()}</span>
            </div>
            <div>Contenido generado con IA · Curado por equipo pedagógico</div>
          </div>
        </footer>
      </div>
    </div>
  )
}
