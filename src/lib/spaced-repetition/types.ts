export type ReviewRating = 'again' | 'hard' | 'good' | 'easy'

export type CardState = 'New' | 'Learning' | 'Review' | 'Relearning'

export interface ReviewCard {
  id: string
  student_id: string
  question_id: string
  state: CardState
  stability: number
  difficulty: number
  due_at: string
  last_review_at: string | null
  reps: number
  lapses: number
  created_at: string
}

export interface ReviewLog {
  id: string
  card_id: string
  rating: ReviewRating
  state: CardState
  scheduled_days: number
  elapsed_days: number
  review_at: string
  stability: number
  difficulty: number
}

export interface SchedulingResult {
  card: ReviewCard
  log: ReviewLog
}
