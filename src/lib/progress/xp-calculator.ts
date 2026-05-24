export const XP_VALUES = {
  LESSON_COMPLETE: 10,
  QUIZ_COMPLETE: 15,
  QUIZ_PERFECT_BONUS: 30,
  REINFORCEMENT_COMPLETE: 20,
  CHALLENGE_COMPLETE: 25,
  REVIEW_CARD: 5,
  STREAK_7_BONUS: 50,
  STREAK_30_BONUS: 200,
} as const

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 */
export function calculateLevel(totalXp: number): number {
  return Math.floor(Math.sqrt(totalXp / 100)) + 1
}

/**
 * Calculate XP needed for next level
 */
export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100
}

/**
 * Calculate XP progress within current level
 */
export function getLevelProgress(totalXp: number): {
  currentLevel: number
  currentLevelXp: number
  nextLevelXp: number
  progressPercent: number
} {
  const currentLevel = calculateLevel(totalXp)
  const currentLevelXp = xpForLevel(currentLevel)
  const nextLevelXp = xpForLevel(currentLevel + 1)
  const progressPercent = ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100

  return {
    currentLevel,
    currentLevelXp,
    nextLevelXp,
    progressPercent: Math.min(Math.max(progressPercent, 0), 100),
  }
}

/**
 * Calculate quiz XP with path multiplier
 */
export function calculateQuizXp(
  scorePercent: number,
  xpMultiplier: number
): number {
  let xp = XP_VALUES.QUIZ_COMPLETE

  if (scorePercent >= 100) {
    xp += XP_VALUES.QUIZ_PERFECT_BONUS
  }

  return Math.round(xp * xpMultiplier)
}
