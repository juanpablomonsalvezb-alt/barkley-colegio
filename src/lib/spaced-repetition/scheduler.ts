import type {
  ReviewCard,
  ReviewRating,
  CardState,
  SchedulingResult,
  ReviewLog,
} from './types'

const DESIRED_RETENTION = 0.9

// Rating multipliers for stability
const RATING_STABILITY_MULTIPLIER: Record<ReviewRating, number> = {
  again: 0.2,
  hard: 0.6,
  good: 1.0,
  easy: 1.3,
}

// Rating adjustments for difficulty (higher = harder)
const RATING_DIFFICULTY_DELTA: Record<ReviewRating, number> = {
  again: 0.3,
  hard: 0.15,
  good: 0,
  easy: -0.15,
}

/**
 * Get desired retention rate.
 */
export function getDesiredRetention(): number {
  return DESIRED_RETENTION
}

/**
 * Schedule a review for a card based on the given rating.
 */
export function scheduleReview(
  card: ReviewCard,
  rating: ReviewRating,
  now?: Date
): SchedulingResult {
  const reviewDate = now || new Date()
  const reviewAtStr = reviewDate.toISOString()

  // Calculate elapsed days since last review
  const elapsedDays = card.last_review_at
    ? Math.max(
        0,
        (reviewDate.getTime() - new Date(card.last_review_at).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0

  // Calculate new difficulty (clamped between 0.1 and 1.0)
  const newDifficulty = Math.min(
    1.0,
    Math.max(0.1, card.difficulty + RATING_DIFFICULTY_DELTA[rating])
  )

  // Calculate new stability
  let newStability: number
  const nextState = getNextState(card.state, rating)

  if (card.state === 'New') {
    // Initial stability based on rating
    const initialStabilities: Record<ReviewRating, number> = {
      again: 0.25,
      hard: 0.5,
      good: 1.0,
      easy: 2.5,
    }
    newStability = initialStabilities[rating]
  } else if (rating === 'again') {
    // Lapse: reduce stability significantly
    newStability = Math.max(0.25, card.stability * 0.2)
  } else {
    // Review: scale stability
    newStability =
      card.stability * RATING_STABILITY_MULTIPLIER[rating] * (1 + elapsedDays * 0.1)
    newStability = Math.max(0.25, newStability)
  }

  // Calculate scheduled days until next review
  const scheduledDays = calculateInterval(newStability, DESIRED_RETENTION)

  // Calculate due date
  const dueDate = new Date(reviewDate)
  dueDate.setDate(dueDate.getDate() + Math.ceil(scheduledDays))

  const newLapses = rating === 'again' ? card.lapses + 1 : card.lapses

  const updatedCard: ReviewCard = {
    ...card,
    state: nextState,
    stability: Math.round(newStability * 100) / 100,
    difficulty: Math.round(newDifficulty * 100) / 100,
    due_at: dueDate.toISOString(),
    last_review_at: reviewAtStr,
    reps: card.reps + 1,
    lapses: newLapses,
  }

  const log: ReviewLog = {
    id: crypto.randomUUID(),
    card_id: card.id,
    rating,
    state: nextState,
    scheduled_days: Math.ceil(scheduledDays),
    elapsed_days: Math.round(elapsedDays * 100) / 100,
    review_at: reviewAtStr,
    stability: updatedCard.stability,
    difficulty: updatedCard.difficulty,
  }

  return { card: updatedCard, log }
}

/**
 * Create a new review card for a student and question.
 */
export function createNewCard(
  studentId: string,
  questionId: string
): ReviewCard {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    student_id: studentId,
    question_id: questionId,
    state: 'New',
    stability: 0,
    difficulty: 0.5,
    due_at: now,
    last_review_at: null,
    reps: 0,
    lapses: 0,
    created_at: now,
  }
}

/**
 * Calculate the review interval in days based on stability and desired retention.
 * Uses simplified FSRS formula: interval = S * (-log(R) / log(2))^(1/1.5)
 */
function calculateInterval(stability: number, retention: number): number {
  if (stability <= 0) return 0.25

  const interval =
    stability * Math.pow(-Math.log(retention) / Math.log(2), 1 / 1.5)

  // Clamp between 0.25 days (6 hours) and 365 days
  return Math.min(365, Math.max(0.25, interval))
}

/**
 * Determine the next card state based on current state and rating.
 */
function getNextState(currentState: CardState, rating: ReviewRating): CardState {
  if (rating === 'again') {
    return currentState === 'New' ? 'Learning' : 'Relearning'
  }

  switch (currentState) {
    case 'New':
      return rating === 'easy' ? 'Review' : 'Learning'
    case 'Learning':
      return rating === 'good' || rating === 'easy' ? 'Review' : 'Learning'
    case 'Relearning':
      return rating === 'good' || rating === 'easy' ? 'Review' : 'Relearning'
    case 'Review':
      return 'Review'
    default:
      return 'Review'
  }
}
