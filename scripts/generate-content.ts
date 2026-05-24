/**
 * CLI generador de contenido Barkley.
 *
 * Uso:
 *   pnpm tsx scripts/generate-content.ts --grade 4_basico --oa MA04-OA01           # 1 OA piloto
 *   pnpm tsx scripts/generate-content.ts --grade 4_basico --subject matematica     # 1 asignatura
 *   pnpm tsx scripts/generate-content.ts --grade 4_basico                          # grado completo
 *   pnpm tsx scripts/generate-content.ts --grade 4_basico --dry-run                # estima costo sin llamar API
 *
 * Output:
 *   - JSON crudos en generated/{grade}/{oa_code}.json
 *   - Inserta en Supabase: lessons.content_html, lessons.video_url, quizzes, questions, adaptive_rules
 *   - Reporte final: total cost, tokens, lecciones generadas
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { loadBook, estimateTokens, truncateBook } from '../src/lib/content-generation/book-loader'
import { generatePiece, generateFullOA, type OAInput, type GenerationResult } from '../src/lib/content-generation/generator-v2'

config({ path: '.env.local' })

// ─── CLI args ────────────────────────────────────────────────
function getArg(name: string): string | undefined {
  const idx = process.argv.indexOf(`--${name}`)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}
function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`)
}

const GRADE = getArg('grade') ?? '4_basico'
const ONLY_SUBJECT = getArg('subject')
const ONLY_OA = getArg('oa')
const DRY_RUN = hasFlag('dry-run')
const FORCE_HAIKU = hasFlag('all-haiku')
const FORCE_SONNET = hasFlag('all-sonnet')

// Edad por grado (heurística para prompts)
const GRADE_AGES: Record<string, { age: number; label: string }> = {
  '1_basico': { age: 6, label: '1° Básico' },
  '2_basico': { age: 7, label: '2° Básico' },
  '3_basico': { age: 8, label: '3° Básico' },
  '4_basico': { age: 9, label: '4° Básico' },
  '5_basico': { age: 10, label: '5° Básico' },
  '6_basico': { age: 11, label: '6° Básico' },
  '7_basico': { age: 12, label: '7° Básico' },
  '8_basico': { age: 13, label: '8° Básico' },
  '1_medio': { age: 14, label: '1° Medio' },
  '2_medio': { age: 15, label: '2° Medio' },
  '3_medio': { age: 16, label: '3° Medio' },
  '4_medio': { age: 17, label: '4° Medio' },
}

// Mapping subject_key del manifest → nombre legible
const SUBJECT_NAMES: Record<string, string> = {
  matematica: 'Matemática',
  lenguaje_y_comunicacion: 'Lenguaje y Comunicación',
  lengua_y_literatura: 'Lengua y Literatura',
  ciencias_naturales: 'Ciencias Naturales',
  historia_geografia_y_ciencias_sociales: 'Historia, Geografía y Cs. Sociales',
  ingles: 'Inglés',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// ─── Helpers ────────────────────────────────────────────────
function slugify(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

async function findLessonByOA(oa_code: string): Promise<{ id: string; unit_id: string } | null> {
  // Buscar lesson cuyo slug contenga el oa_code lowercase
  const { data, error } = await supabase
    .from('lessons')
    .select('id, unit_id, slug')
    .ilike('slug', `${oa_code.toLowerCase()}%`)
    .limit(1)
    .maybeSingle()
  if (error) {
    console.error(`  ⚠ Error buscando lesson ${oa_code}:`, error.message)
    return null
  }
  return data
}

async function insertGeneratedContent(oa: OAInput, results: GenerationResult[]) {
  const lesson = await findLessonByOA(oa.oa_code)
  if (!lesson) {
    console.warn(`  ⚠ Lesson placeholder no encontrada para ${oa.oa_code}. Corre seed primero.`)
    return
  }

  const lessonData = results.find((r) => r.type === 'lesson')?.output as any
  const quizData = results.find((r) => r.type === 'quiz')?.output as any
  const reinforcementData = results.find((r) => r.type === 'reinforcement')?.output as any
  const challengeData = results.find((r) => r.type === 'challenge')?.output as any

  // 1. Update lesson con contenido
  if (lessonData) {
    await supabase
      .from('lessons')
      .update({
        title: lessonData.title?.slice(0, 200) ?? oa.oa_description.slice(0, 120),
        content_html: lessonData.contentHtml ?? lessonData.content_html,
        estimated_minutes: lessonData.estimatedMinutes ?? lessonData.estimated_minutes ?? 15,
        difficulty_level: lessonData.difficulty_level ?? 2,
        reinforcement_content_html: reinforcementData?.contentHtml ?? reinforcementData?.content_html,
        challenge_content_html: challengeData?.contentHtml ?? challengeData?.content_html,
        challenge_project_description:
          typeof challengeData?.projectDescription === 'string'
            ? challengeData.projectDescription
            : JSON.stringify(challengeData?.project_description ?? {}),
      })
      .eq('id', lesson.id)
  }

  // 2. Crear quiz + questions
  if (quizData?.questions?.length) {
    const { data: quiz } = await supabase
      .from('quizzes')
      .upsert(
        {
          lesson_id: lesson.id,
          title: quizData.title ?? `Quiz: ${oa.oa_code}`,
          passing_score: quizData.passing_score ?? 60,
          time_limit_seconds: quizData.time_limit_seconds ?? 480,
          max_attempts: quizData.max_attempts ?? 3,
          shuffle_questions: true,
          shuffle_options: true,
          show_correct_after: true,
          is_published: false,
          total_questions: quizData.questions.length,
        },
        { onConflict: 'lesson_id' }
      )
      .select('id')
      .single()

    if (quiz) {
      // Limpiar preguntas previas para idempotencia
      await supabase.from('questions').delete().eq('quiz_id', quiz.id)
      const questions = quizData.questions.map((q: any, idx: number) => ({
        quiz_id: quiz.id,
        question_type: q.question_type ?? 'opcion_multiple',
        question_text: q.question_text,
        display_order: idx + 1,
        points: q.points ?? 1,
        difficulty_level: q.difficulty_level ?? 1,
        topic_tag: q.topic_tag ?? null,
        options: q.options ?? [],
        correct_answer: q.correct_answer,
        feedback_correct: q.feedback_correct ?? '',
        feedback_incorrect: q.feedback_incorrect ?? '',
        feedback_hint: q.feedback_hint ?? null,
        feedback_per_option: q.feedback_per_option ?? {},
      }))
      await supabase.from('questions').insert(questions)
    }
  }

  // 3. Crear adaptive_rules para esta lesson
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

  console.log(`  💾 Insertado a Supabase: lesson ${lesson.id}`)
}

// ─── Main ────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀 Generación contenido Barkley\n   grade=${GRADE}${ONLY_SUBJECT ? ` subject=${ONLY_SUBJECT}` : ''}${ONLY_OA ? ` oa=${ONLY_OA}` : ''}${DRY_RUN ? ' DRY-RUN' : ''}\n`)

  const manifest = JSON.parse(readFileSync(join(process.cwd(), 'temarios/manifest.json'), 'utf-8'))
  const gradeData = manifest.grades[GRADE]
  if (!gradeData) throw new Error(`Grade ${GRADE} no existe en manifest`)
  const gradeInfo = GRADE_AGES[GRADE]

  // Filtrar OAs según flags
  const subjectsToProcess = ONLY_SUBJECT ? [ONLY_SUBJECT] : Object.keys(gradeData.subjects)

  const outDir = join(process.cwd(), 'generated', GRADE)
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

  let totalCost = 0
  let totalTokensIn = 0
  let totalTokensOut = 0
  let totalCacheRead = 0
  let totalCacheWrite = 0
  let totalCalls = 0
  let totalOAs = 0

  for (const subject_key of subjectsToProcess) {
    const subj = gradeData.subjects[subject_key]
    if (!subj) {
      console.warn(`⚠ Subject ${subject_key} no existe en manifest`)
      continue
    }
    const oas = ONLY_OA
      ? subj.objetivos_aprendizaje.filter((o: any) => o.oa_code === ONLY_OA)
      : subj.objetivos_aprendizaje
    if (oas.length === 0) continue

    console.log(`\n📚 ${SUBJECT_NAMES[subject_key] ?? subject_key}: ${oas.length} OA(s)`)

    // Cargar libro de la asignatura
    let bookMd: string | null = null
    try {
      const book = await loadBook(GRADE, subject_key)
      const tokens = estimateTokens(book.total_chars)
      console.log(`   📖 Libro: ${book.files.length} archivo(s), ${book.total_chars.toLocaleString()} chars (~${tokens.toLocaleString()} tokens)`)
      // Limitar a 100k tokens para no saturar contexto
      bookMd = truncateBook(book, 100_000)
    } catch (e: any) {
      console.warn(`   ⚠ Sin libro: ${e.message}`)
    }

    if (DRY_RUN) {
      const estPerOA = bookMd ? 0.7 : 0.4 // rough estimate
      const estCost = oas.length * estPerOA
      console.log(`   💵 Estimación dry-run: $${estCost.toFixed(2)} para ${oas.length} OAs`)
      totalCost += estCost
      continue
    }

    for (const oa of oas) {
      totalOAs++
      const input: OAInput = {
        grade_label: gradeInfo.label,
        grade_age: gradeInfo.age,
        subject_name: SUBJECT_NAMES[subject_key] ?? subject_key,
        eje: oa.eje ?? subj.ejes?.[0] ?? 'General',
        oa_code: oa.oa_code,
        oa_number: oa.oa_number,
        oa_description: oa.description,
        indicadores: oa.indicadores ?? [],
      }

      console.log(`\n  🎯 ${oa.oa_code}: ${oa.description.slice(0, 80)}...`)

      try {
        const results = await generateFullOA(input, {
          bookMd,
          modelOverride: FORCE_HAIKU ? 'claude-haiku-4-5-20251015' : FORCE_SONNET ? 'claude-sonnet-4-5-20250929' : undefined,
          verbose: true,
        })

        // Guardar JSON crudo
        const outPath = join(outDir, `${oa.oa_code}.json`)
        writeFileSync(outPath, JSON.stringify({ oa: input, results }, null, 2))

        // Insert a DB
        await insertGeneratedContent(input, results)

        // Métricas
        for (const r of results) {
          totalCost += r.cost_usd
          totalTokensIn += r.usage.input_tokens
          totalTokensOut += r.usage.output_tokens
          totalCacheRead += r.usage.cache_read_input_tokens
          totalCacheWrite += r.usage.cache_creation_input_tokens
          totalCalls++
        }
      } catch (e: any) {
        console.error(`  ❌ Error en ${oa.oa_code}: ${e.message}`)
      }
    }
  }

  console.log(`\n${'─'.repeat(60)}\n📊 REPORTE FINAL\n${'─'.repeat(60)}`)
  console.log(`OAs procesados:     ${totalOAs}`)
  console.log(`Llamadas API:       ${totalCalls}`)
  console.log(`Tokens input:       ${totalTokensIn.toLocaleString()}`)
  console.log(`Tokens output:      ${totalTokensOut.toLocaleString()}`)
  console.log(`Cache writes:       ${totalCacheWrite.toLocaleString()}`)
  console.log(`Cache reads:        ${totalCacheRead.toLocaleString()}`)
  console.log(`💵 COSTO TOTAL:     $${totalCost.toFixed(4)} USD`)
  console.log('─'.repeat(60))
}

main().catch((err) => {
  console.error('\n❌ Generación falló:', err)
  process.exit(1)
})
