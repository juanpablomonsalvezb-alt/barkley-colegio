// ─── Content Validators ─────────────────────────────────────────────────────

interface ValidationResult {
  valid: boolean
  errors: string[]
}

const VALID_QUESTION_TYPES = ['opcion_multiple', 'verdadero_falso', 'completar']

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function validateQuestionShape(q: unknown, index: number): string[] {
  const errors: string[] = []
  if (!q || typeof q !== 'object') {
    errors.push(`Pregunta ${index + 1}: no es un objeto válido.`)
    return errors
  }
  const question = q as Record<string, unknown>

  if (!isNonEmptyString(question.question_text)) {
    errors.push(`Pregunta ${index + 1}: falta question_text.`)
  }
  if (!VALID_QUESTION_TYPES.includes(question.question_type as string)) {
    errors.push(
      `Pregunta ${index + 1}: question_type inválido "${question.question_type}".`
    )
  }
  if (question.correct_answer === undefined || question.correct_answer === null) {
    errors.push(`Pregunta ${index + 1}: falta correct_answer.`)
  }
  if (!isNonEmptyString(question.feedback_correct)) {
    errors.push(`Pregunta ${index + 1}: falta feedback_correct.`)
  }
  if (!isNonEmptyString(question.feedback_incorrect)) {
    errors.push(`Pregunta ${index + 1}: falta feedback_incorrect.`)
  }

  return errors
}

// ─── Lesson ─────────────────────────────────────────────────────────────────

export function validateLesson(data: unknown): ValidationResult {
  const errors: string[] = []
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El dato no es un objeto válido.'] }
  }
  const d = data as Record<string, unknown>

  if (!isNonEmptyString(d.videoScript)) {
    errors.push('Falta videoScript o está vacío.')
  } else {
    const wordCount = (d.videoScript as string).split(/\s+/).length
    if (wordCount < 800) {
      errors.push(
        `videoScript tiene ${wordCount} palabras (mínimo 800).`
      )
    }
    if (wordCount > 1200) {
      errors.push(
        `videoScript tiene ${wordCount} palabras (máximo 1200).`
      )
    }
  }

  if (!isNonEmptyString(d.contentHtml)) {
    errors.push('Falta contentHtml o está vacío.')
  }

  if (!isNonEmptyString(d.summary)) {
    errors.push('Falta summary o está vacío.')
  }

  return { valid: errors.length === 0, errors }
}

// ─── Quiz ───────────────────────────────────────────────────────────────────

export function validateQuiz(data: unknown): ValidationResult {
  const errors: string[] = []
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El dato no es un objeto válido.'] }
  }
  const d = data as Record<string, unknown>

  if (!Array.isArray(d.questions)) {
    return { valid: false, errors: ['Falta el array de questions.'] }
  }

  if (d.questions.length < 20) {
    errors.push(
      `Solo hay ${d.questions.length} preguntas (mínimo 20).`
    )
  }

  d.questions.forEach((q: unknown, i: number) => {
    errors.push(...validateQuestionShape(q, i))
  })

  return { valid: errors.length === 0, errors }
}

// ─── Reinforcement ──────────────────────────────────────────────────────────

export function validateReinforcement(data: unknown): ValidationResult {
  const errors: string[] = []
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El dato no es un objeto válido.'] }
  }
  const d = data as Record<string, unknown>

  if (!isNonEmptyString(d.contentHtml)) {
    errors.push('Falta contentHtml o está vacío.')
  }

  if (!Array.isArray(d.questions)) {
    errors.push('Falta el array de questions.')
  } else {
    if (d.questions.length < 5) {
      errors.push(
        `Solo hay ${d.questions.length} preguntas de refuerzo (mínimo 5).`
      )
    }
    d.questions.forEach((q: unknown, i: number) => {
      errors.push(...validateQuestionShape(q, i))
      if (
        q &&
        typeof q === 'object' &&
        (q as Record<string, unknown>).difficulty_level !== undefined
      ) {
        const diff = (q as Record<string, unknown>).difficulty_level as number
        if (diff > 2) {
          errors.push(
            `Pregunta ${i + 1}: dificultad ${diff} es mayor a 2 para refuerzo.`
          )
        }
      }
    })
  }

  return { valid: errors.length === 0, errors }
}

// ─── Challenge ──────────────────────────────────────────────────────────────

export function validateChallenge(data: unknown): ValidationResult {
  const errors: string[] = []
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['El dato no es un objeto válido.'] }
  }
  const d = data as Record<string, unknown>

  if (!isNonEmptyString(d.contentHtml)) {
    errors.push('Falta contentHtml o está vacío.')
  }

  if (!isNonEmptyString(d.projectDescription)) {
    errors.push('Falta projectDescription o está vacío.')
  }

  return { valid: errors.length === 0, errors }
}
