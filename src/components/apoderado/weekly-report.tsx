'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, FileCheck, Zap, Target, Clock } from 'lucide-react'
import { formatDuration } from '@/lib/formatters'
import { cn } from '@/lib/utils'

interface WeeklyReportProps {
  studentId: string
}

interface DailyData {
  activity_date: string
  lessons_completed: number
  quizzes_completed: number
  xp_earned: number
  avg_quiz_score: number | null
  time_seconds: number
}

export function WeeklyReport({ studentId }: WeeklyReportProps) {
  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchWeekly() {
      try {
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const dateStr = sevenDaysAgo.toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('daily_activity')
          .select('*')
          .eq('student_id', studentId)
          .gte('activity_date', dateStr)
          .order('activity_date', { ascending: true })

        if (error) throw error
        setDailyData((data as DailyData[]) || [])
      } catch (err) {
        console.error('Error fetching weekly report:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWeekly()
  }, [studentId])

  // Aggregate stats
  const totalLessons = dailyData.reduce(
    (sum, d) => sum + (d.lessons_completed || 0),
    0
  )
  const totalQuizzes = dailyData.reduce(
    (sum, d) => sum + (d.quizzes_completed || 0),
    0
  )
  const totalXp = dailyData.reduce((sum, d) => sum + (d.xp_earned || 0), 0)
  const quizScores = dailyData
    .filter((d) => d.avg_quiz_score !== null)
    .map((d) => d.avg_quiz_score as number)
  const avgQuizScore =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : 0
  const totalTime = dailyData.reduce(
    (sum, d) => sum + (d.time_seconds || 0),
    0
  )

  // Chart data
  const maxActivity = Math.max(
    1,
    ...dailyData.map(
      (d) => (d.lessons_completed || 0) + (d.quizzes_completed || 0)
    )
  )

  // Build 7-day labels
  const dayLabels: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dayLabels.push(d.toLocaleDateString('es-CL', { weekday: 'short' }))
  }

  // Map activity to the last 7 days
  const chartData = dayLabels.map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const match = dailyData.find((dd) => dd.activity_date === dateStr)
    return match
      ? (match.lessons_completed || 0) + (match.quizzes_completed || 0)
      : 0
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="h-32 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Reporte Semanal</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight">{totalLessons}</p>
              <p className="text-[10px] text-muted-foreground">Lecciones</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <FileCheck className="h-4 w-4 text-green-500 shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight">{totalQuizzes}</p>
              <p className="text-[10px] text-muted-foreground">Quizzes</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight">{totalXp}</p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
            <Target className="h-4 w-4 text-purple-500 shrink-0" />
            <div>
              <p className="text-lg font-bold leading-tight">{avgQuizScore}%</p>
              <p className="text-[10px] text-muted-foreground">Promedio</p>
            </div>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold">{formatDuration(totalTime)}</p>
            <p className="text-[10px] text-muted-foreground">Tiempo total esta semana</p>
          </div>
        </div>

        {/* Daily Activity Bar Chart */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Actividad diaria
          </p>
          <div className="flex items-end gap-1 h-20">
            {chartData.map((value, i) => {
              const height =
                value > 0
                  ? Math.max(8, (value / Math.max(1, ...chartData)) * 100)
                  : 4

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-0.5"
                >
                  <div
                    className={cn(
                      'w-full rounded-t transition-all duration-500',
                      value > 0 ? 'bg-primary' : 'bg-muted-foreground/20'
                    )}
                    style={{
                      height: `${height}%`,
                      minHeight: value > 0 ? '8px' : '4px',
                    }}
                  />
                  <span className="text-[9px] text-muted-foreground capitalize">
                    {dayLabels[i]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
