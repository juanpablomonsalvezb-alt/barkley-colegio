/**
 * Lector de libros escolares en formato Markdown.
 * Mapea grado + asignatura → ruta del archivo .md correspondiente.
 */
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const LIBROS_ROOT = join(process.cwd(), 'LIBROS ESCOLARES')

/** Mapping grado → carpeta */
const GRADE_FOLDER: Record<string, string> = {
  '1_basico': '1BASICO',
  '2_basico': '2BASICO',
  '3_basico': '3BASICO',
  '4_basico': '4BASICO',
  '5_basico': '5BASICO',
  '6_basico': '6BASICO',
  '7_basico': '7BASICO',
  '8_basico': '8BASICO',
  '1_medio': '1MEDIO',
  '2_medio': '2MEDIO',
  '3_medio': '3MEDIO',
  '4_medio': '4MEDIO',
}

/** Mapping subject → prefijo de archivo (heurística por contenido del nombre) */
const SUBJECT_PATTERNS: Record<string, RegExp[]> = {
  matematica: [/MAT/i],
  lenguaje_y_comunicacion: [/LYC/i, /LEN/i],
  lengua_y_literatura: [/LYL/i, /LEN/i],
  ciencias_naturales: [/CNA/i, /CIE/i],
  historia_geografia_y_ciencias_sociales: [/HIS/i, /HGC/i],
  ingles: [/ING/i],
  fisica: [/FIS/i],
  quimica: [/QUI/i],
  biologia: [/BIO/i],
  filosofia: [/FIL/i],
  educacion_ciudadana: [/EDC/i, /CIU/i],
  ciencias_para_la_ciudadania: [/CPC/i],
}

export interface BookContent {
  subject_key: string
  grade_key: string
  files: { filename: string; content: string }[]
  total_chars: number
}

/**
 * Carga TODOS los .md de un grado+asignatura, los concatena.
 * Asignaturas pueden tener varios libros (ej Matemática parte 1 + 2).
 */
export async function loadBook(grade_key: string, subject_key: string): Promise<BookContent> {
  const folder = GRADE_FOLDER[grade_key]
  if (!folder) throw new Error(`Grado desconocido: ${grade_key}`)

  const dir = join(LIBROS_ROOT, folder)
  if (!existsSync(dir)) throw new Error(`Carpeta no existe: ${dir}`)

  const patterns = SUBJECT_PATTERNS[subject_key]
  if (!patterns) throw new Error(`Asignatura sin patrón: ${subject_key}`)

  const { readdirSync } = await import('node:fs')
  const allFiles = readdirSync(dir).filter((f) => f.endsWith('.md'))

  const matched = allFiles.filter((f) => patterns.some((re) => re.test(f)))
  if (matched.length === 0) {
    throw new Error(`Sin libros .md para ${subject_key} en ${grade_key}. Esperado en ${dir}`)
  }

  const files = await Promise.all(
    matched.sort().map(async (filename) => ({
      filename,
      content: await readFile(join(dir, filename), 'utf-8'),
    }))
  )

  return {
    subject_key,
    grade_key,
    files,
    total_chars: files.reduce((acc, f) => acc + f.content.length, 0),
  }
}

/** Estima tokens (4 chars ≈ 1 token aproximado) */
export function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4)
}

/** Trunca libro a N tokens máximos preservando inicio (índice + primeras unidades) */
export function truncateBook(book: BookContent, maxTokens: number): string {
  const maxChars = maxTokens * 4
  const combined = book.files.map((f) => `\n\n# Archivo: ${f.filename}\n\n${f.content}`).join('')
  if (combined.length <= maxChars) return combined
  return combined.slice(0, maxChars) + '\n\n[... contenido truncado por límite de tokens ...]'
}
