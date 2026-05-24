import { create } from 'zustand'
import type { Question, QuestionAnswer, AdaptiveAction, AdaptivePath } from '@/lib/quiz/types'

interface QuizState {
  // Quiz data
  questions: Question[]
  currentIndex: number
  answers: Map<string, { answer: any; timeSeconds: number }>

  // Timer
  timeRemaining: number | null
  questionStartTime: number

  // Results
  isCompleted: boolean
  scoreEarned: number
  scoreTotal: number
  scorePercent: number
  assignedPath: AdaptivePath | null
  adaptiveAction: AdaptiveAction | null
  questionResults: QuestionAnswer[]

  // Feedback
  showFeedback: boolean
  currentFeedback: string | null
  currentIsCorrect: boolean | null

  // Actions
  initQuiz: (questions: Question[], timeLimit: number | null) => void
  submitAnswer: (answer: any, timeSeconds: number) => void
  showAnswerFeedback: (feedback: string, isCorrect: boolean) => void
  nextQuestion: () => void
  completeQuiz: (result: {
    scoreEarned: number
    scoreTotal: number
    scorePercent: number
    assignedPath: AdaptivePath
    adaptiveAction: AdaptiveAction
    answers: QuestionAnswer[]
  }) => void
  setTimeRemaining: (time: number) => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  answers: new Map(),
  timeRemaining: null,
  questionStartTime: Date.now(),
  isCompleted: false,
  scoreEarned: 0,
  scoreTotal: 0,
  scorePercent: 0,
  assignedPath: null,
  adaptiveAction: null,
  questionResults: [],
  showFeedback: false,
  currentFeedback: null,
  currentIsCorrect: null,

  initQuiz: (questions, timeLimit) => set({
    questions,
    currentIndex: 0,
    answers: new Map(),
    timeRemaining: timeLimit,
    questionStartTime: Date.now(),
    isCompleted: false,
    scoreEarned: 0,
    scoreTotal: 0,
    scorePercent: 0,
    assignedPath: null,
    adaptiveAction: null,
    questionResults: [],
    showFeedback: false,
    currentFeedback: null,
    currentIsCorrect: null,
  }),

  submitAnswer: (answer, timeSeconds) => {
    const { questions, currentIndex, answers } = get()
    const question = questions[currentIndex]
    if (!question) return

    const newAnswers = new Map(answers)
    newAnswers.set(question.id, { answer, timeSeconds })
    set({ answers: newAnswers })
  },

  showAnswerFeedback: (feedback, isCorrect) => set({
    showFeedback: true,
    currentFeedback: feedback,
    currentIsCorrect: isCorrect,
  }),

  nextQuestion: () => {
    const { currentIndex, questions } = get()
    if (currentIndex < questions.length - 1) {
      set({
        currentIndex: currentIndex + 1,
        questionStartTime: Date.now(),
        showFeedback: false,
        currentFeedback: null,
        currentIsCorrect: null,
      })
    }
  },

  completeQuiz: (result) => set({
    isCompleted: true,
    scoreEarned: result.scoreEarned,
    scoreTotal: result.scoreTotal,
    scorePercent: result.scorePercent,
    assignedPath: result.assignedPath,
    adaptiveAction: result.adaptiveAction,
    questionResults: result.answers,
    showFeedback: false,
  }),

  setTimeRemaining: (time) => set({ timeRemaining: time }),

  reset: () => set({
    questions: [],
    currentIndex: 0,
    answers: new Map(),
    timeRemaining: null,
    questionStartTime: Date.now(),
    isCompleted: false,
    scoreEarned: 0,
    scoreTotal: 0,
    scorePercent: 0,
    assignedPath: null,
    adaptiveAction: null,
    questionResults: [],
    showFeedback: false,
    currentFeedback: null,
    currentIsCorrect: null,
  }),
}))
