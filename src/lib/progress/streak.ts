/**
 * Calculate the current streak of consecutive days with activity up to today.
 */
export function calculateStreak(
  activities: { activity_date: string }[]
): number {
  if (activities.length === 0) return 0

  // Get unique dates sorted descending
  const uniqueDates = [
    ...new Set(activities.map((a) => a.activity_date)),
  ].sort((a, b) => b.localeCompare(a))

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayStr = formatDateStr(today)
  const yesterdayStr = formatDateStr(yesterday)

  // Streak must start from today or yesterday
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0
  }

  let streak = 0
  let checkDate = uniqueDates[0] === todayStr ? today : yesterday

  for (const dateStr of uniqueDates) {
    const expectedStr = formatDateStr(checkDate)

    if (dateStr === expectedStr) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (dateStr < expectedStr) {
      // Gap found
      break
    }
  }

  return streak
}

/**
 * Check if the streak is still active (last activity was today or yesterday).
 */
export function isStreakActive(lastDate: string | null): boolean {
  if (!lastDate) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const last = new Date(lastDate)
  last.setHours(0, 0, 0, 0)

  return last.getTime() === today.getTime() || last.getTime() === yesterday.getTime()
}

/**
 * Get a motivational message in Spanish based on streak length.
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return '¡Comienza tu racha hoy!'
  if (streak === 1) return '¡Primer dia! Sigue asi manana.'
  if (streak < 3) return `¡${streak} dias seguidos! Buen comienzo.`
  if (streak < 7) return `¡${streak} dias de racha! Vas muy bien.`
  if (streak < 14) return `¡${streak} dias! Eres imparable.`
  if (streak < 30) return `¡${streak} dias de racha! Eres una maquina.`
  if (streak < 60) return `¡${streak} dias! Dedicacion de campeon.`
  if (streak < 100) return `¡${streak} dias seguidos! Increible constancia.`
  return `¡${streak} dias de racha! Leyenda absoluta.`
}

function formatDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
