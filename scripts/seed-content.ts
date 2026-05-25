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

async function insertOA(j: OAJson, expansionOnly = false) {
  const oa_code = j.oa.oa_code
  const lesson = await findLessonByOA(oa_code)
  if (!lesson) {
    console.warn(`  ⚠ Sin placeholder para ${oa_code}. Corre seed-4basico.ts primero.`)
    return
  }

  // Modo expansión: solo insertar sub_lessons + practice_sets, no tocar lesson/quiz/refuerzo/desafío
  if (expansionOnly) {
    return insertExpansion(j, lesson, oa_code)
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

  // 2. Insert formal quiz (after deleting previous formal one)
  await supabase.from('quizzes').delete().eq('lesson_id', lesson.id).eq('quiz_kind', 'formal')
  const quizPayload: any = {
    lesson_id: lesson.id,
    title: j.quiz.title ?? `Quiz: ${oa_code}`,
    quiz_kind: 'formal',
    passing_score: j.quiz.passing_score ?? 60,
    time_limit_seconds: j.quiz.time_limit_seconds ?? 480,
    max_attempts: j.quiz.max_attempts ?? 3,
    shuffle_questions: true,
    shuffle_options: true,
    show_correct_after: true,
    total_questions: j.quiz.questions.length,
    display_order: 1,
  }
  if (PUBLISH) quizPayload.is_published = true

  const { data: quiz, error: qErr } = await supabase
    .from('quizzes')
    .insert(quizPayload)
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

  // 4.5. Sub-lecciones (si las hay)
  const subLessons = (j as any).sub_lessons as any[] | undefined
  if (subLessons?.length) {
    // Borrar sub-lecciones previas
    await supabase.from('lessons').delete().eq('parent_lesson_id', lesson.id).eq('lesson_kind', 'sub')
    for (let i = 0; i < subLessons.length; i++) {
      const sub = subLessons[i]
      const subPayload: any = {
        unit_id: lesson.unit_id,
        parent_lesson_id: lesson.id,
        lesson_kind: 'sub',
        title: sub.title?.slice(0, 200) ?? `Sub-tema ${i + 1}`,
        slug: `${oa_code.toLowerCase()}-sub-${i + 1}-${(sub.title ?? 'subtema').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`,
        lesson_type: 'mixto',
        display_order: 100 + i,
        content_html: sub.contentHtml,
        estimated_minutes: sub.estimatedMinutes ?? 12,
        difficulty_level: sub.difficulty_level ?? 2,
        is_essential: true,
      }
      if (PUBLISH) subPayload.is_published = true
      await supabase.from('lessons').insert(subPayload)
    }
  }

  // 4.6. Practice sets (quizzes adicionales con quiz_kind != 'formal')
  const practiceSets = (j as any).practice_sets as any[] | undefined
  if (practiceSets?.length) {
    // Borrar practice quizzes previos
    await supabase.from('quizzes').delete().eq('lesson_id', lesson.id).neq('quiz_kind', 'formal')
    for (let i = 0; i < practiceSets.length; i++) {
      const ps = practiceSets[i]
      const psPayload: any = {
        lesson_id: lesson.id,
        title: ps.title ?? `Práctica ${i + 1}`,
        quiz_kind: ps.kind ?? 'practice_medium',
        passing_score: 0,
        time_limit_seconds: ps.time_limit_seconds ?? 600,
        max_attempts: 99,
        shuffle_questions: true,
        shuffle_options: true,
        show_correct_after: true,
        total_questions: ps.questions?.length ?? 0,
        display_order: 10 + i,
      }
      if (PUBLISH) psPayload.is_published = true
      const { data: psQuiz } = await supabase.from('quizzes').insert(psPayload).select('id').single()
      if (psQuiz && ps.questions?.length) {
        const psQs = ps.questions.map((q: any, idx: number) => ({
          quiz_id: psQuiz.id,
          question_type: q.question_type ?? 'opcion_multiple',
          question_text: q.question_text,
          display_order: idx + 1,
          points: q.points ?? 1,
          difficulty_level: q.difficulty_level ?? 1,
          topic_tag: q.topic_tag ?? null,
          options: q.options,
          correct_answer: q.correct_answer,
          feedback_correct: q.feedback_correct ?? '',
          feedback_incorrect: q.feedback_incorrect ?? '',
          feedback_hint: q.feedback_hint ?? null,
          feedback_per_option: q.feedback_per_option ?? {},
        }))
        await supabase.from('questions').insert(psQs)
      }
    }
  }

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

async function insertExpansion(j: any, lesson: { id: string; unit_id: string }, oa_code: string) {
  // Sub-lecciones
  const subLessons = j.sub_lessons as any[] | undefined
  if (subLessons?.length) {
    await supabase.from('lessons').delete().eq('parent_lesson_id', lesson.id).eq('lesson_kind', 'sub')
    for (let i = 0; i < subLessons.length; i++) {
      const sub = subLessons[i]
      const subPayload: any = {
        unit_id: lesson.unit_id,
        parent_lesson_id: lesson.id,
        lesson_kind: 'sub',
        title: sub.title?.slice(0, 200) ?? `Sub-tema ${i + 1}`,
        slug: `${oa_code.toLowerCase()}-sub-${i + 1}-${String(sub.title ?? 'sub').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 60)}`,
        lesson_type: 'mixto',
        display_order: 100 + i,
        content_html: sub.contentHtml,
        estimated_minutes: sub.estimatedMinutes ?? 12,
        difficulty_level: sub.difficulty_level ?? 2,
        is_essential: true,
      }
      if (PUBLISH) subPayload.is_published = true
      await supabase.from('lessons').insert(subPayload)
    }
  }

  // Practice sets
  const practiceSets = j.practice_sets as any[] | undefined
  if (practiceSets?.length) {
    await supabase.from('quizzes').delete().eq('lesson_id', lesson.id).neq('quiz_kind', 'formal')
    for (let i = 0; i < practiceSets.length; i++) {
      const ps = practiceSets[i]
      const psPayload: any = {
        lesson_id: lesson.id,
        title: ps.title ?? `Práctica ${i + 1}`,
        quiz_kind: ps.kind ?? 'practice_medium',
        passing_score: 0,
        time_limit_seconds: ps.time_limit_seconds ?? 600,
        max_attempts: 99,
        shuffle_questions: true,
        shuffle_options: true,
        show_correct_after: true,
        total_questions: ps.questions?.length ?? 0,
        display_order: 10 + i,
      }
      if (PUBLISH) psPayload.is_published = true
      const { data: psQuiz } = await supabase.from('quizzes').insert(psPayload).select('id').single()
      if (psQuiz && ps.questions?.length) {
        const psQs = ps.questions.map((q: any, idx: number) => ({
          quiz_id: psQuiz.id,
          question_type: q.question_type ?? 'opcion_multiple',
          question_text: q.question_text,
          display_order: idx + 1,
          points: q.points ?? 1,
          difficulty_level: q.difficulty_level ?? 1,
          topic_tag: q.topic_tag ?? null,
          options: q.options,
          correct_answer: q.correct_answer,
          feedback_correct: q.feedback_correct ?? '',
          feedback_incorrect: q.feedback_incorrect ?? '',
          feedback_hint: q.feedback_hint ?? null,
          feedback_per_option: q.feedback_per_option ?? {},
        }))
        await supabase.from('questions').insert(psQs)
      }
    }
  }

  const subCount = subLessons?.length ?? 0
  const psCount = practiceSets?.length ?? 0
  console.log(`  ✓ ${oa_code} EXPAND → ${subCount} sub-lecciones · ${psCount} sets práctica`)
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
    const isExpansion = oa_code.startsWith('EXPAND-')
    try {
      await insertOA(json, isExpansion)
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
