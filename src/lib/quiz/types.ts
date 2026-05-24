export type QuestionType = 'opcion_multiple' | 'verdadero_falso' | 'completar' | 'ordenar' | 'asociar'
export type AdaptivePath = 'refuerzo' | 'normal' | 'desafio'

export interface QuizOption {
  id: string
  text: string
  image_url?: string
  correct_position?: number // for ordenar
  left_text?: string // for asociar
  right_text?: string // for asociar
}

export interface Question {
  id: string
  quiz_id: string
  question_type: QuestionType
  question_text: string
  question_image_url: string | null
  display_order: number
  points: number
  difficulty_level: number
  topic_tag: string | null
  options: QuizOption[]
  correct_answer: any // varies by type
  feedback_correct: string
  feedback_incorrect: string
  feedback_hint: string | null
  feedback_per_option: Record<string, string>
}

export interface Quiz {
  id: string
  lesson_id: string
  title: string
  description: string | null
  passing_score: number
  time_limit_seconds: number | null
  max_attempts: number
  shuffle_questions: boolean
  shuffle_options: boolean
  show_correct_after: boolean
  total_questions: number
}

export interface QuestionAnswer {
  question_id: string
  selected_answer: any
  is_correct: boolean
  time_seconds: number
}

export interface QuizResult {
  score_earned: number
  score_total: number
  score_percent: number
  answers: QuestionAnswer[]
  assigned_path: AdaptivePath
}

export interface AdaptiveAction {
  path: AdaptivePath
  show_reinforcement: boolean
  show_challenge: boolean
  extra_quiz_ids?: string[]
  suggested_review_lesson_ids?: string[]
  message_title: string
  message_body: string
  xp_multiplier: number
  unlock_badge_id?: string | null
}
