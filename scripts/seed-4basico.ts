/**
 * Seed Supabase con estructura completa de 4° básico (sin contenido).
 *
 * Crea:
 *  - 4 subjects (Matemática, Lenguaje y Comunicación, Ciencias Naturales, Historia/Geo/Cs.Soc)
 *  - 4 courses (uno por subject para 4° básico)
 *  - 13 units (agrupadas por eje del temario)
 *  - 32 lesson placeholders (1 por OA, sin content_html aún)
 *
 * Idempotente: usa upsert sobre slugs únicos.
 * Run: pnpm tsx scripts/seed-4basico.ts
 */
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import ws from 'ws'

config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, realtime: { transport: ws as any } }
)

const GRADE = '4_basico'
const GRADE_LABEL = '4° Básico'

/** Mapping eje canónico por asignatura (limpia ejes mal parseados del manifest) */
const CANONICAL_EJES: Record<string, string[]> = {
  matematica: ['Números y Operaciones', 'Patrones y Álgebra', 'Geometría', 'Medición', 'Datos y Probabilidades'],
  lenguaje_y_comunicacion: ['Lectura', 'Escritura'],
  ciencias_naturales: ['Ciencias de la Vida', 'Ciencias Físicas y Químicas', 'Ciencias de la Tierra y el Universo'],
  historia_geografia_y_ciencias_sociales: ['Historia', 'Geografía', 'Formación Ciudadana'],
}

/** Mapping subject_key del manifest → metadata DB */
const SUBJECT_META: Record<string, { name: string; slug: string; color: string; icon: string; order: number }> = {
  matematica: { name: 'Matemática', slug: 'matematica', color: '#3b82f6', icon: '🔢', order: 1 },
  lenguaje_y_comunicacion: { name: 'Lenguaje y Comunicación', slug: 'lenguaje-y-comunicacion', color: '#ef4444', icon: '📚', order: 2 },
  ciencias_naturales: { name: 'Ciencias Naturales', slug: 'ciencias-naturales', color: '#22c55e', icon: '🔬', order: 3 },
  historia_geografia_y_ciencias_sociales: { name: 'Historia, Geografía y Cs. Sociales', slug: 'historia', color: '#f97316', icon: '🌎', order: 4 },
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Heurística: asigna un OA a un eje canónico por keywords en su descripción */
function assignEje(subject_key: string, oa_description: string): string {
  const ejes = CANONICAL_EJES[subject_key] ?? []
  const desc = oa_description.toLowerCase()

  if (subject_key === 'matematica') {
    if (/n[uú]mer|operac|suma|resta|multiplic|divis|fracci/i.test(desc)) return 'Números y Operaciones'
    if (/patr[oó]n|secuenc|igualdad|ecuaci/i.test(desc)) return 'Patrones y Álgebra'
    if (/geomet|figura|cuerpo|simetr|coordenad|ángulo|angulo/i.test(desc)) return 'Geometría'
    if (/medi|longitud|área|area|per[ií]metro|capacidad|masa|tiempo/i.test(desc)) return 'Medición'
    if (/dato|gr[aá]fico|tabla|probabilidad|estad/i.test(desc)) return 'Datos y Probabilidades'
    return ejes[0]
  }
  if (subject_key === 'lenguaje_y_comunicacion') {
    if (/escrib|redact|texto|borrador|revisar/i.test(desc)) return 'Escritura'
    return 'Lectura'
  }
  if (subject_key === 'ciencias_naturales') {
    if (/planta|animal|ser viv|h[aá]bitat|ecosistema|cuerpo human|c[eé]lula/i.test(desc)) return 'Ciencias de la Vida'
    if (/energ[ií]a|fuerza|movimiento|materia|sustancia|mezcla|sonido|luz|electric|magnet/i.test(desc)) return 'Ciencias Físicas y Químicas'
    if (/tierra|universo|planeta|sol|luna|atm[oó]sfera|agua|recurso/i.test(desc)) return 'Ciencias de la Tierra y el Universo'
    return 'Ciencias de la Vida'
  }
  if (subject_key === 'historia_geografia_y_ciencias_sociales') {
    if (/ciudadan|democrac|derecho|deber|comunidad|conviven/i.test(desc)) return 'Formación Ciudadana'
    if (/geogr|mapa|ubicaci[oó]n|continente|paisaje|recurso natural|relieve|clima/i.test(desc)) return 'Geografía'
    return 'Historia'
  }
  return ejes[0] ?? 'General'
}

async function main() {
  console.log('🌱 Seed 4° básico arrancando...\n')

  // Cargar manifest
  const manifestPath = join(process.cwd(), 'temarios/manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
  const grade = manifest.grades[GRADE]
  if (!grade) throw new Error('Grado 4_basico no encontrado en manifest')

  // ─── 1. Upsert subjects ─────────────────────────────────────
  console.log('📚 Insertando subjects...')
  const subjectIdByKey: Record<string, string> = {}
  for (const subject_key of Object.keys(grade.subjects)) {
    const meta = SUBJECT_META[subject_key]
    if (!meta) {
      console.warn(`  ⚠ Sin metadata para subject_key=${subject_key}, salteo`)
      continue
    }
    const { data, error } = await supabase
      .from('subjects')
      .upsert(
        {
          name: meta.name,
          slug: meta.slug,
          color: meta.color,
          icon_url: meta.icon,
          display_order: meta.order,
        },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()
    if (error) throw error
    subjectIdByKey[subject_key] = data.id
    console.log(`  ✓ ${meta.name} (${data.id})`)
  }

  // ─── 2. Upsert courses ──────────────────────────────────────
  console.log('\n📖 Insertando courses...')
  const courseIdBySubject: Record<string, string> = {}
  for (const [subject_key, subject_id] of Object.entries(subjectIdByKey)) {
    const meta = SUBJECT_META[subject_key]
    const subj = grade.subjects[subject_key]
    const total_oa = subj.objetivos_aprendizaje.length

    const { data, error } = await supabase
      .from('courses')
      .upsert(
        {
          subject_id,
          grade_level: GRADE,
          title: `${meta.name} ${GRADE_LABEL}`,
          slug: `${meta.slug}-${GRADE}`,
          description: subj.description?.slice(0, 500) ?? `Curso ${meta.name} para ${GRADE_LABEL} alineado al temario MINEDUC.`,
          is_published: false,
          total_units: 0,
          total_lessons: total_oa,
        },
        { onConflict: 'subject_id,grade_level' }
      )
      .select('id')
      .single()
    if (error) throw error
    courseIdBySubject[subject_key] = data.id
    console.log(`  ✓ ${meta.name} ${GRADE_LABEL} (${total_oa} OAs) → ${data.id}`)
  }

  // ─── 3. Group OAs by eje, upsert units, then lessons ────────
  console.log('\n📂 Insertando units + lesson placeholders...')

  let totalUnits = 0
  let totalLessons = 0

  for (const [subject_key, course_id] of Object.entries(courseIdBySubject)) {
    const subj = grade.subjects[subject_key]
    const ejes_canonical = CANONICAL_EJES[subject_key] ?? []

    // Agrupar OAs por eje
    const oasByEje: Record<string, typeof subj.objetivos_aprendizaje> = {}
    for (const oa of subj.objetivos_aprendizaje) {
      const eje = assignEje(subject_key, oa.description)
      if (!oasByEje[eje]) oasByEje[eje] = []
      oasByEje[eje].push(oa)
    }

    // Crear units en orden canónico (omitir ejes sin OAs)
    const ejes_with_oas = ejes_canonical.filter((e) => oasByEje[e]?.length > 0)
    for (let i = 0; i < ejes_with_oas.length; i++) {
      const eje = ejes_with_oas[i]
      const oas = oasByEje[eje]

      const { data: unit, error: unitErr } = await supabase
        .from('units')
        .upsert(
          {
            course_id,
            title: eje,
            slug: slugify(eje),
            description: `Unidad: ${eje}. ${oas.length} objetivo(s) de aprendizaje del temario MINEDUC.`,
            display_order: i + 1,
            is_published: false,
            total_lessons: oas.length,
          },
          { onConflict: 'course_id,display_order' }
        )
        .select('id')
        .single()
      if (unitErr) throw unitErr
      totalUnits++

      // Lessons: 1 por OA
      for (let j = 0; j < oas.length; j++) {
        const oa = oas[j]
        const lessonSlug = slugify(`${oa.oa_code}-${oa.description.slice(0, 40)}`)
        const { error: lessErr } = await supabase.from('lessons').upsert(
          {
            unit_id: unit.id,
            title: oa.description.slice(0, 120),
            slug: lessonSlug.slice(0, 120),
            lesson_type: 'mixto',
            display_order: j + 1,
            is_published: false,
            difficulty_level: 2,
            estimated_minutes: 15,
            prerequisites: [],
            // Metadata curricular en columnas existentes; content_html se llenará luego
            content_html: `<!-- placeholder OA ${oa.oa_code} -->`,
          },
          { onConflict: 'unit_id,display_order' }
        )
        if (lessErr) throw lessErr
        totalLessons++
      }
      console.log(`    ${SUBJECT_META[subject_key].name} > ${eje}: ${oas.length} lecciones`)
    }

    // Update total_units cache en course
    await supabase
      .from('courses')
      .update({ total_units: ejes_with_oas.length })
      .eq('id', course_id)
  }

  console.log(`\n✅ Seed terminado:`)
  console.log(`   ${Object.keys(subjectIdByKey).length} subjects`)
  console.log(`   ${Object.keys(courseIdBySubject).length} courses`)
  console.log(`   ${totalUnits} units`)
  console.log(`   ${totalLessons} lesson placeholders`)
}

main().catch((err) => {
  console.error('\n❌ Seed falló:', err)
  process.exit(1)
})
