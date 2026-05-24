// ─── Content Generation Types ───────────────────────────────────────────────

export type ContentType =
  | 'lesson'
  | 'quiz'
  | 'reinforcement'
  | 'challenge'
  | 'adaptive_rules'

export interface GenerationParams {
  subject: string
  gradeLevel: string
  topic: string
  learningObjectives: string[]
  /** 1 = muy fácil, 5 = muy difícil */
  difficulty: 1 | 2 | 3 | 4 | 5
  style: string
  curriculumCode?: string
}

// ─── Generated Content Shapes ───────────────────────────────────────────────

export interface GeneratedQuestion {
  question_text: string
  question_type: 'opcion_multiple' | 'verdadero_falso' | 'completar'
  options: Record<string, string> // e.g. { a: "...", b: "...", c: "...", d: "..." }
  correct_answer: string | string[]
  feedback_correct: string
  feedback_incorrect: string
  feedback_per_option: Record<string, string> | null
  feedback_hint: string | null
  difficulty_level: number
  topic_tag: string
  points: number
}

export interface GeneratedLesson {
  videoScript: string
  contentHtml: string
  summary: string
  estimatedMinutes: number
}

export interface GeneratedQuiz {
  questions: GeneratedQuestion[]
}

export interface GeneratedReinforcement {
  contentHtml: string
  questions: GeneratedQuestion[]
}

export interface GeneratedChallenge {
  contentHtml: string
  projectDescription: string
}

export interface AdaptiveRuleEntry {
  messageTitle: string
  messageBody: string
  xpMultiplier: number
}

export interface GeneratedAdaptiveRules {
  refuerzo: AdaptiveRuleEntry
  normal: AdaptiveRuleEntry
  desafio: AdaptiveRuleEntry
}

// ─── Job ────────────────────────────────────────────────────────────────────

export type ContentGenStatus =
  | 'pendiente'
  | 'generando'
  | 'revision'
  | 'aprobado'
  | 'rechazado'

export interface GenerationJob {
  id: string
  target_type: string
  input_params: GenerationParams
  output_content: unknown | null
  status: ContentGenStatus
  requested_by: string
  reviewed_by: string | null
  reviewed_at: string | null
  review_notes: string | null
  model_used: string | null
  tokens_used: number | null
  generation_time_ms: number | null
  error_message: string | null
  target_lesson_id: string | null
  target_course_id: string | null
  created_at: string
  updated_at: string
}
