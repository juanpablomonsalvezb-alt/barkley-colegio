import type { Question, QuestionType } from './types'

/**
 * Normalize text for comparison (completar type)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove accents
    .replace(/\s+/g, ' ')
}

/**
 * Check if answer is correct based on question type
 */
export function checkAnswer(question: Question, selectedAnswer: any): boolean {
  const { question_type, correct_answer } = question

  switch (question_type) {
    case 'opcion_multiple':
      return selectedAnswer === correct_answer

    case 'verdadero_falso':
      return selectedAnswer === correct_answer

    case 'completar':
      return normalizeText(String(selectedAnswer)) === normalizeText(String(correct_answer))

    case 'ordenar':
      if (!Array.isArray(selectedAnswer) || !Array.isArray(correct_answer)) return false
      return JSON.stringify(selectedAnswer) === JSON.stringify(correct_answer)

    case 'asociar':
      if (typeof selectedAnswer !== 'object' || typeof correct_answer !== 'object') return false
      const correctPairs = correct_answer as Record<string, string>
      const selectedPairs = selectedAnswer as Record<string, string>
      const keys = Object.keys(correctPairs)
      if (keys.length !== Object.keys(selectedPairs).length) return false
      return keys.every(key => correctPairs[key] === selectedPairs[key])

    default:
      return false
  }
}

/**
 * Get feedback for a given answer
 */
export function getFeedback(question: Question, selectedAnswer: any, isCorrect: boolean): string {
  if (isCorrect) return question.feedback_correct

  // For opcion_multiple, check if there's specific feedback for the selected option
  if (question.question_type === 'opcion_multiple' && question.feedback_per_option) {
    const specificFeedback = question.feedback_per_option[selectedAnswer]
    if (specificFeedback) return specificFeedback
  }

  return question.feedback_incorrect
}

/**
 * Shuffle array using Fisher-Yates
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Prepare questions for quiz (shuffle if needed)
 */
export function prepareQuestions(
  questions: Question[],
  shuffleQuestions: boolean,
  shuffleOptions: boolean
): Question[] {
  let prepared = shuffleQuestions ? shuffleArray(questions) : [...questions]

  if (shuffleOptions) {
    prepared = prepared.map(q => {
      // Don't shuffle verdadero_falso or ordenar options
      if (q.question_type === 'verdadero_falso' || q.question_type === 'ordenar') {
        return q
      }
      return { ...q, options: shuffleArray(q.options) }
    })
  }

  return prepared
}
