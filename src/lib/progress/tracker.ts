import { createClient } from '@/lib/supabase/client'
import { calculateLevel } from './xp-calculator'

/**
 * Update daily activity for streak tracking
 */
export async function trackDailyActivity(
  studentId: string,
  updates: {
    lessonsCompleted?: number
    quizzesCompleted?: number
    xpEarned?: number
    timeSpentSeconds?: number
  }
) {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('student_id', studentId)
    .eq('activity_date', today)
    .single()

  if (existing) {
    await supabase
      .from('daily_activity')
      .update({
        lessons_completed: (existing as any).lessons_completed + (updates.lessonsCompleted || 0),
        quizzes_completed: (existing as any).quizzes_completed + (updates.quizzesCompleted || 0),
        xp_earned: (existing as any).xp_earned + (updates.xpEarned || 0),
        time_spent_seconds: (existing as any).time_spent_seconds + (updates.timeSpentSeconds || 0),
      })
      .eq('id', (existing as any).id)
  } else {
    await supabase
      .from('daily_activity')
      .insert({
        student_id: studentId,
        activity_date: today,
        lessons_completed: updates.lessonsCompleted || 0,
        quizzes_completed: updates.quizzesCompleted || 0,
        xp_earned: updates.xpEarned || 0,
        time_spent_seconds: updates.timeSpentSeconds || 0,
      })
  }
}

/**
 * Add XP to student and update level
 */
export async function addXp(studentId: string, xpAmount: number) {
  const supabase = createClient()

  const { data: stats } = await supabase
    .from('student_stats')
    .select('total_xp')
    .eq('student_id', studentId)
    .single()

  const newTotalXp = ((stats as any)?.total_xp || 0) + xpAmount
  const newLevel = calculateLevel(newTotalXp)

  await supabase
    .from('student_stats')
    .update({
      total_xp: newTotalXp,
      current_level: newLevel,
      last_activity_date: new Date().toISOString().split('T')[0],
    })
    .eq('student_id', studentId)

  return { totalXp: newTotalXp, level: newLevel }
}
