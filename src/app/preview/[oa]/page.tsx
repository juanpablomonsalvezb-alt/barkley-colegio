/**
 * Página pública de preview de una lección Barkley.
 * URL: /preview/MA04-OA01
 * Sin login, sin middleware, sin fricción. Muestra lección + quiz + audio overview.
 */
import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'

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

export default async function PreviewPage({ params }: PageProps) {
  const { oa: oaCode } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Buscar lección por OA en slug
  const { data: lesson } = await supabase
    .from('lessons')
    .select(
      `id, title, content_html, estimated_minutes, difficulty_level,
       reinforcement_content_html, challenge_content_html, challenge_project_description,
       unit_id,
       units(id, title, audio_overview_url, audio_overview_status,
             courses(id, title, grade_level, subjects(name, color, icon_url)))`
    )
    .ilike('slug', `${oaCode.toLowerCase()}%`)
    .limit(1)
    .maybeSingle()

  if (!lesson) notFound()

  // Quiz + preguntas
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

  const passingScore = quiz?.passing_score ?? 60
  const timeMin = quiz?.time_limit_seconds ? Math.ceil(quiz.time_limit_seconds / 60) : null

  function renderOption(opt: QuestionOption | string, idx: number) {
    const id = typeof opt === 'string' ? String.fromCharCode(97 + idx) : opt.id
    const text = typeof opt === 'string' ? opt : opt.text
    return { id, text }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
            <span>🐶 Barkley · Preview público</span>
            <span>·</span>
            <span className="font-mono">{oaCode}</span>
          </div>
          {subject && (
            <div className="flex items-center gap-2 mb-2 text-blue-100 text-sm">
              <span className="text-2xl">{subject.icon_url}</span>
              <span>{subject.name}</span>
              <span>·</span>
              <span>{course?.title}</span>
              <span>·</span>
              <span>{unit?.title}</span>
            </div>
          )}
          <h1 className="text-4xl font-bold mt-2">{lesson.title}</h1>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">⏱ {lesson.estimated_minutes ?? 15} min</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              Dificultad {'⚡'.repeat(lesson.difficulty_level ?? 2)}
            </span>
            {quiz && (
              <span className="bg-white/20 px-3 py-1 rounded-full">
                📝 {questions.length} preguntas
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Audio overview */}
        {audioUrl && (
          <section className="bg-purple-100 border-2 border-purple-300 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-purple-900 mb-3">🎙️ Podcast educativo de esta unidad</h2>
            <p className="text-sm text-purple-700 mb-4">
              Generado automáticamente con IA. Escucha el resumen completo en formato conversación entre 2 voces.
            </p>
            <audio controls src={audioUrl} className="w-full" />
            <p className="text-xs text-purple-600 mt-2">
              💾 <a href={audioUrl} download className="underline">Descargar MP3</a>
            </p>
          </section>
        )}

        {/* Lesson content */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div
            className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg"
            dangerouslySetInnerHTML={{ __html: lesson.content_html ?? '' }}
          />
        </section>

        {/* Quiz */}
        {questions.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{quiz?.title ?? 'Quiz'}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {questions.length} preguntas · Aprueba con {passingScore}%
                  {timeMin && ` · ${timeMin} min`}
                </p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                PREVIEW · respuestas visibles
              </span>
            </div>

            <div className="space-y-6">
              {questions.map((q, idx) => {
                const opts = Array.isArray(q.options)
                  ? q.options.map((o, i) => renderOption(o, i))
                  : Object.entries((q.options as Record<string, string>) ?? {}).map(([id, text]) => ({ id, text }))
                const correct = q.correct_answer
                const isCorrect = (id: string) =>
                  Array.isArray(correct) ? correct.includes(id) : correct === id

                return (
                  <div key={q.id} className="border border-slate-200 rounded-xl p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <span className="bg-slate-200 text-slate-700 font-mono text-xs px-2 py-1 rounded">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{q.question_text}</p>
                        <div className="flex gap-2 mt-1 text-xs text-slate-500">
                          <span>{q.question_type}</span>
                          <span>·</span>
                          <span>Dificultad {q.difficulty_level}</span>
                          {q.topic_tag && (
                            <>
                              <span>·</span>
                              <span className="bg-slate-100 px-2 rounded">{q.topic_tag}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    {opts.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                        {opts.map((opt) => {
                          const ok = isCorrect(opt.id)
                          return (
                            <div
                              key={opt.id}
                              className={`p-3 rounded-lg border-2 text-sm ${
                                ok
                                  ? 'border-green-500 bg-green-50 text-green-900 font-medium'
                                  : 'border-slate-200 bg-slate-50 text-slate-700'
                              }`}
                            >
                              <span className="font-mono text-xs mr-2">{opt.id})</span>
                              {opt.text}
                              {ok && <span className="ml-2">✓</span>}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Completar/ordenar: mostrar respuesta */}
                    {opts.length === 0 || (q.question_type === 'completar' || q.question_type === 'ordenar') ? (
                      <div className="mb-3 text-sm">
                        <strong className="text-green-700">Respuesta correcta:</strong>{' '}
                        <code className="bg-green-50 px-2 py-1 rounded">
                          {typeof correct === 'string'
                            ? correct
                            : JSON.stringify(correct)}
                        </code>
                      </div>
                    ) : null}

                    {/* Feedback */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:underline">
                        Ver feedback completo
                      </summary>
                      <div className="mt-2 space-y-2 text-slate-700 pl-3 border-l-2 border-slate-200">
                        <div>
                          <strong className="text-green-700">✓ Correcto:</strong> {q.feedback_correct}
                        </div>
                        <div>
                          <strong className="text-red-700">✗ Incorrecto:</strong> {q.feedback_incorrect}
                        </div>
                        {q.feedback_hint && (
                          <div>
                            <strong className="text-amber-700">💡 Hint:</strong> {q.feedback_hint}
                          </div>
                        )}
                        {q.feedback_per_option && Object.keys(q.feedback_per_option).length > 0 && (
                          <div>
                            <strong>Feedback por opción:</strong>
                            <ul className="mt-1 ml-4 list-disc">
                              {Object.entries(q.feedback_per_option).map(([id, txt]) => (
                                <li key={id}>
                                  <span className="font-mono">{id})</span> {txt}
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
          </section>
        )}

        {/* Reinforcement */}
        {lesson.reinforcement_content_html && (
          <section className="bg-amber-50 rounded-2xl border-2 border-amber-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔁</span>
              <h2 className="text-2xl font-bold text-amber-900">Refuerzo (ruta &lt; 60%)</h2>
            </div>
            <p className="text-sm text-amber-700 mb-4">
              Contenido alternativo simplificado para estudiantes que necesitan repasar.
            </p>
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.reinforcement_content_html }}
            />
          </section>
        )}

        {/* Challenge */}
        {lesson.challenge_content_html && (
          <section className="bg-purple-50 rounded-2xl border-2 border-purple-200 p-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚀</span>
              <h2 className="text-2xl font-bold text-purple-900">Desafío (ruta &gt; 85%)</h2>
            </div>
            <p className="text-sm text-purple-700 mb-4">
              Contenido avanzado para estudiantes que dominan el OA.
            </p>
            <div
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.challenge_content_html }}
            />
            {lesson.challenge_project_description && (
              <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">📐 Proyecto práctico</h3>
                <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                  {lesson.challenge_project_description}
                </pre>
              </div>
            )}
          </section>
        )}

        <footer className="text-center text-xs text-slate-400 py-8">
          Preview público generado desde Supabase · Lesson ID: {lesson.id}
        </footer>
      </main>
    </div>
  )
}
