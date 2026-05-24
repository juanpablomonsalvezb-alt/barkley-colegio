/**
 * Seed CONTENIDO ya generado a Supabase.
 * Lee generated/{grade}/*.json y popula lessons/quizzes/questions/adaptive_rules.
 * Sin IA. Sin API key Anthropic. 100% archivos locales.
 *
 * Uso:
 *   npx tsx scripts/seed-content.ts                          # 4° básico todos
 *   npx tsx scripts/seed-content.ts --grade 4_basico         # explicito
 *   npx tsx scripts/seed-content.ts --oa MA04-OA01           # solo 1 OA
 *   npx tsx scripts/seed-content.ts --publish                # marca lessons/quizzes is_published=true
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import ws from 'ws'

config({ path: '.env.local' })

function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  return idx === -1 ? undefined : process.argv[idx + 1]
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

const GRADE = getArg('grade') ?? '4_basico'
const ONLY_OA = getArg('oa')
const PUBLISH = hasFlag('publish')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, realtime: { transport: ws as any } }
)

async function findLessonByOA(oa_code: string): Promise<{ id: string; unit_id: string } | null> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id, unit_id, slug')
    .ilike('slug', `${oa_code.toLowerCase()}%`)
    .limit(1)
    .maybeSingle()
  if (error) return null
  return data
}

interface OAJson {
  oa: {
    oa_code: string
    oa_description: string
    subject_name: string
    eje: string
  }
  lesson: {
    title: string
    contentHtml: string
    estimatedMinutes?: number
    difficulty_level?: number
    summary?: string
    videoScript?: string
  }
  quiz: {
    title?: string
    passing_score?: number
    time_limit_seconds?: number
    max_attempts?: number
    questions: Array<{
      question_type: string
      question_text: string
      options: any
      correct_answer: any
      feedback_correct: string
      feedback_incorrect: string
      feedback_hint?: string
      feedback_per_option?: any
      difficulty_level?: number
      topic_tag?: string
      points?: number
    }>
  }
  reinforcement: {
    contentHtml: string
    questions?: any[]
  }
  challenge: {
    contentHtml: string
    projectDescription?: string
  }
}

async function insertOA(j: OAJson) {
  const oa_code = j.oa.oa_code
  const lesson = await findLessonByOA(oa_code)
  if (!lesson) {
    console.warn(`  ⚠ Sin placeholder para ${oa_code}. Corre seed-4basico.ts primero.`)
    return
  }

  // 1. Update lesson
  const lessonUpdate: any = {
    title: j.lesson.title?.slice(0, 200) ?? j.oa.oa_description.slice(0, 120),
    content_html: j.lesson.contentHtml,
    estimated_minutes: j.lesson.estimatedMinutes ?? 15,
    difficulty_level: j.lesson.difficulty_level ?? 2,
    reinforcement_content_html: j.reinforcement?.contentHtml ?? null,
    challenge_content_html: j.challenge?.contentHtml ?? null,
    challenge_project_description: j.challenge?.projectDescription ?? null,
  }
  if (PUBLISH) lessonUpdate.is_published = true

  const { error: leErr } = await supabase.from('lessons').update(lessonUpdate).eq('id', lesson.id)
  if (leErr) throw leErr

  // 2. Upsert quiz
  const quizUpsert: any = {
    lesson_id: lesson.id,
    title: j.quiz.title ?? `Quiz: ${oa_code}`,
    passing_score: j.quiz.passing_score ?? 60,
    time_limit_seconds: j.quiz.time_limit_seconds ?? 480,
    max_attempts: j.quiz.max_attempts ?? 3,
    shuffle_questions: true,
    shuffle_options: true,
    show_correct_after: true,
    total_questions: j.quiz.questions.length,
  }
  if (PUBLISH) quizUpsert.is_published = true

  const { data: quiz, error: qErr } = await supabase
    .from('quizzes')
    .upsert(quizUpsert, { onConflict: 'lesson_id' })
    .select('id')
    .single()
  if (qErr) throw qErr

  // 3. Delete + insert questions
  await supabase.from('questions').delete().eq('quiz_id', quiz.id)
  const qs = j.quiz.questions.map((q, idx) => ({
    quiz_id: quiz.id,
    question_type: q.question_type,
    question_text: q.question_text,
    display_order: idx + 1,
    points: q.points ?? 1,
    difficulty_level: q.difficulty_level ?? 1,
    topic_tag: q.topic_tag ?? null,
    options: q.options,
    correct_answer: q.correct_answer,
    feedback_correct: q.feedback_correct,
    feedback_incorrect: q.feedback_incorrect,
    feedback_hint: q.feedback_hint ?? null,
    feedback_per_option: q.feedback_per_option ?? {},
  }))
  const { error: qsErr } = await supabase.from('questions').insert(qs)
  if (qsErr) throw qsErr

  // 4. Adaptive rules
  await supabase.from('adaptive_rules').delete().eq('lesson_id', lesson.id)
  await supabase.from('adaptive_rules').insert([
    {
      lesson_id: lesson.id,
      min_score_percent: 0,
      max_score_percent: 60,
      path: 'refuerzo',
      next_action: {
        show_reinforcement: true,
        show_challenge: false,
        message_title: '¡Vamos a reforzar esto!',
        message_body: 'Algunas ideas necesitan más práctica. Tenemos contenido extra preparado para ti.',
        xp_multiplier: 0.5,
      },
    },
    {
      lesson_id: lesson.id,
      min_score_percent: 61,
      max_score_percent: 85,
      path: 'normal',
      next_action: {
        show_reinforcement: false,
        show_challenge: false,
        message_title: '¡Buen trabajo!',
        message_body: 'Dominas este tema. Puedes avanzar a la siguiente lección.',
        xp_multiplier: 1.0,
      },
    },
    {
      lesson_id: lesson.id,
      min_score_percent: 86,
      max_score_percent: 100,
      path: 'desafio',
      next_action: {
        show_reinforcement: false,
        show_challenge: true,
        message_title: '¡Eres un crack!',
        message_body: 'Dominio total. Te preparamos un desafío para llevarte al siguiente nivel.',
        xp_multiplier: 1.5,
      },
    },
  ])

  // 5. Reinforcement questions (si las hay)
  if (j.reinforcement?.questions?.length) {
    await supabase.from('reinforcement_questions').delete().eq('lesson_id', lesson.id)
    const rqs = j.reinforcement.questions.map((q: any, idx: number) => ({
      lesson_id: lesson.id,
      question_type: q.question_type ?? 'opcion_multiple',
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      feedback_correct: q.feedback_correct,
      feedback_incorrect: q.feedback_incorrect,
      difficulty_level: q.difficulty_level ?? 1,
      display_order: idx + 1,
    }))
    await supabase.from('reinforcement_questions').insert(rqs)
  }

  console.log(`  ✓ ${oa_code} → lesson ${lesson.id} (${j.quiz.questions.length} preguntas)`)
}

async function main() {
  const dir = join(process.cwd(), 'generated', GRADE)
  if (!existsSync(dir)) {
    console.error(`❌ Directorio no existe: ${dir}`)
    console.error(`   Crea contenido en generated/${GRADE}/{OA_CODE}.json primero`)
    process.exit(1)
  }

  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  console.log(`\n📥 Seed contenido ${GRADE} desde ${files.length} archivo(s)\n`)

  let processed = 0
  for (const f of files) {
    const oa_code = f.replace('.json', '')
    if (ONLY_OA && oa_code !== ONLY_OA) continue
    const json: OAJson = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
    try {
      await insertOA(json)
      processed++
    } catch (e: any) {
      console.error(`  ❌ ${oa_code}: ${e.message}`)
    }
  }

  console.log(`\n✅ Insertados ${processed}/${files.length} OAs${PUBLISH ? ' (publicados)' : ' (borrador)'}\n`)
}

main().catch((err) => {
  console.error('❌ Fatal:', err)
  process.exit(1)
})
