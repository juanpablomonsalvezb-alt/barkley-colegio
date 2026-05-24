import type { Question, QuestionAnswer, QuizResult, AdaptivePath } from './types'
import { checkAnswer } from './engine'

/**
 * Calculate quiz score from answers
 */
export function calculateScore(
  questions: Question[],
  answers: Map<string, { answer: any; timeSeconds: number }>
): QuizResult {
  let scoreEarned = 0
  let scoreTotal = 0
  const questionAnswers: QuestionAnswer[] = []

  for (const question of questions) {
    scoreTotal += question.points
    const userAnswer = answers.get(question.id)

    if (userAnswer) {
      const isCorrect = checkAnswer(question, userAnswer.answer)
      if (isCorrect) scoreEarned += question.points

      questionAnswers.push({
        question_id: question.id,
        selected_answer: userAnswer.answer,
        is_correct: isCorrect,
        time_seconds: userAnswer.timeSeconds,
      })
    } else {
      questionAnswers.push({
        question_id: question.id,
        selected_answer: null,
        is_correct: false,
        time_seconds: 0,
      })
    }
  }

  const scorePercent = scoreTotal > 0 ? (scoreEarned / scoreTotal) * 100 : 0
  const assignedPath = getPathFromScore(scorePercent)

  return {
    score_earned: scoreEarned,
    score_total: scoreTotal,
    score_percent: Math.round(scorePercent * 100) / 100,
    answers: questionAnswers,
    assigned_path: assignedPath,
  }
}

/**
 * Determine adaptive path from score percentage
 */
export function getPathFromScore(scorePercent: number): AdaptivePath {
  if (scorePercent <= 60) return 'refuerzo'
  if (scorePercent <= 85) return 'normal'
  return 'desafio'
}
