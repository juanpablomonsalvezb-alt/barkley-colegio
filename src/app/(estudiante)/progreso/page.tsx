import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProgressRing } from '@/components/estudiante/progress-ring'
import { XpBar } from '@/components/estudiante/xp-bar'
import { StreakCounter } from '@/components/estudiante/streak-counter'
import {
  BarChart3,
  Zap,
  Clock,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react'
import { calculateLevel } from '@/lib/progress/xp-calculator'
import { calculateStreak, getStreakMessage } from '@/lib/progress/streak'
import { formatDuration } from '@/lib/formatters'

export default async function ProgresoPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch data in parallel
  const [courseProgressRes, statsRes, activityRes, quizRes] = await Promise.all([
    supabase
      .from('course_progress')
      .select('*, courses(title, subject)')
      .eq('student_id', user.id),
    supabase
      .from('student_stats')
      .select('*')
      .eq('student_id', user.id)
      .single(),
    supabase
      .from('daily_activity')
      .select('*')
      .eq('student_id', user.id)
      .order('activity_date', { ascending: false })
      .limit(7),
    supabase
      .from('quiz_attempts')
      .select('score_percent, created_at, quizzes(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const courseProgress = (courseProgressRes.data || []) as any[]
  const studentStats = statsRes.data as any | null
  const recentActivity = (activityRes.data || []) as any[]
  const recentQuizzes = (quizRes.data || []) as any[]

  // Calculate streak from activity
  const streak = calculateStreak(
    recentActivity.map((a: any) => ({
      activity_date: a.activity_date,
    }))
  )
  const streakMessage = getStreakMessage(streak)

  const totalXp = studentStats?.total_xp || 0
  const level = calculateLevel(totalXp)
  const totalTimeSeconds = studentStats?.total_time_seconds || 0
  const longestStreak = studentStats?.longest_streak || 0

  // Weekly activity data for chart
  const weekDays = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']
  const activityByDay = recentActivity.reduce(
    (acc: Record<string, number>, a: any) => {
      const date = new Date(a.activity_date)
      const dayIndex = (date.getDay() + 6) % 7 // Monday = 0
      acc[weekDays[dayIndex]] = (a.lessons_completed || 0) + (a.quizzes_completed || 0)
      return acc
    },
    {}
  )

  const maxActivity = Math.max(
    1,
    ...Object.values(activityByDay).map(Number)
  )

  // Overall completion
  const avgCompletion =
    courseProgress.length > 0
      ? Math.round(
          courseProgress.reduce(
            (sum: number, cp: any) => sum + (cp.completion_percent || 0),
            0
          ) / courseProgress.length
        )
      : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento detallado de tu avance
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Experiencia
            </CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXp.toLocaleString()} XP</div>
            <XpBar totalXp={totalXp} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nivel
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Nivel {level}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sigue aprendiendo para subir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Racha
            </CardTitle>
            <Target className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <StreakCounter currentStreak={streak} longestStreak={longestStreak} />
            <p className="text-xs text-muted-foreground mt-1">
              {streakMessage}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiempo Total
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(totalTimeSeconds)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de estudio acumulado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Course Progress */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Progreso por Curso
          </h2>

          {courseProgress.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Aun no tienes cursos activos</p>
              </CardContent>
            </Card>
          ) : (
            courseProgress.map((cp: any) => (
              <Card key={cp.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <ProgressRing
                      percent={cp.completion_percent || 0}
                      size={64}
                      strokeWidth={5}
                    >
                      <span className="text-xs font-bold">
                        {Math.round(cp.completion_percent || 0)}%
                      </span>
                    </ProgressRing>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {cp.courses?.title || 'Curso'}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span>
                          {cp.lessons_completed || 0}/{cp.total_lessons || 0}{' '}
                          lecciones
                        </span>
                        <span>
                          {cp.quizzes_completed || 0}/{cp.total_quizzes || 0}{' '}
                          quizzes
                        </span>
                      </div>
                      <Progress
                        value={cp.completion_percent || 0}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Weekly Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Actividad Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-32">
                {weekDays.map((day) => {
                  const value = activityByDay[day] || 0
                  const height =
                    value > 0 ? Math.max(8, (value / maxActivity) * 100) : 4

                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all duration-500"
                        style={{
                          height: `${height}%`,
                          backgroundColor:
                            value > 0
                              ? 'hsl(var(--primary))'
                              : 'hsl(var(--muted))',
                          minHeight: value > 0 ? '8px' : '4px',
                        }}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {day}
                      </span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ultimos Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              {recentQuizzes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sin quizzes recientes
                </p>
              ) : (
                <div className="space-y-3">
                  {recentQuizzes.map((q: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {q.quizzes?.title || 'Quiz'}
                        </p>
                      </div>
                      <Badge
                        variant={
                          q.score_percent >= 80
                            ? 'default'
                            : q.score_percent >= 50
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {q.score_percent}%
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overall Completion */}
          <Card>
            <CardContent className="p-4 text-center">
              <ProgressRing percent={avgCompletion} size={100} strokeWidth={6}>
                <div>
                  <span className="text-xl font-bold">{avgCompletion}%</span>
                  <p className="text-[10px] text-muted-foreground">
                    completado
                  </p>
                </div>
              </ProgressRing>
              <p className="text-sm font-medium mt-2">Avance General</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
