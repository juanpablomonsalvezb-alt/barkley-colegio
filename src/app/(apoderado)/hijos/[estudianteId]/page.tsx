import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ActivityTimeline } from '@/components/apoderado/activity-timeline'
import { WeeklyReport } from '@/components/apoderado/weekly-report'
import { calculateLevel } from '@/lib/progress/xp-calculator'
import { calculateStreak, getStreakMessage } from '@/lib/progress/streak'
import { Flame, Zap, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ estudianteId: string }>
}

export default async function EstudianteDetailPage({ params }: PageProps) {
  const { estudianteId } = await params
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify parent relationship
  const { data: studentProfile } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, grade_level, parent_id')
    .eq('id', estudianteId)
    .single()

  if (!studentProfile || (studentProfile as any).parent_id !== user.id) {
    redirect('/panel')
  }

  const student = studentProfile as any

  // Fetch student data
  const [courseProgressRes, statsRes, activityRes] = await Promise.all([
    supabase
      .from('course_progress')
      .select('*, courses(title, subject)')
      .eq('student_id', estudianteId),
    supabase
      .from('student_stats')
      .select('*')
      .eq('student_id', estudianteId)
      .single(),
    supabase
      .from('daily_activity')
      .select('activity_date')
      .eq('student_id', estudianteId)
      .order('activity_date', { ascending: false })
      .limit(60),
  ])

  const courseProgress = (courseProgressRes.data || []) as any[]
  const stats = statsRes.data as any | null
  const activities = (activityRes.data || []) as any[]

  const totalXp = stats?.total_xp || 0
  const level = calculateLevel(totalXp)
  const streak = calculateStreak(activities)
  const streakMessage = getStreakMessage(streak)
  const longestStreak = stats?.longest_streak || 0

  const initials = student.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/panel"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al panel
      </Link>

      {/* Student Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {student.avatar_url && (
                <AvatarImage src={student.avatar_url} alt={student.full_name} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{student.full_name}</h1>
              <div className="flex items-center gap-3 mt-1">
                {student.grade_level && (
                  <Badge variant="secondary">{student.grade_level}</Badge>
                )}
                <Badge variant="outline">Nivel {level}</Badge>
                <div className="flex items-center gap-1 text-sm text-yellow-600">
                  <Zap className="h-4 w-4 fill-yellow-500" />
                  {totalXp.toLocaleString()} XP
                </div>
                <div className="flex items-center gap-1 text-sm text-orange-600">
                  <Flame className="h-4 w-4 fill-orange-500" />
                  {streak}d racha
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {streakMessage} &middot; Mejor racha: {longestStreak}d
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Course Progress + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          {/* Course Progress */}
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Progreso por Curso
            </h2>

            {courseProgress.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Sin cursos activos
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {courseProgress.map((cp: any) => (
                  <Card key={cp.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">
                          {cp.courses?.title || 'Curso'}
                        </h3>
                        <span className="text-sm font-semibold">
                          {Math.round(cp.completion_percent || 0)}%
                        </span>
                      </div>
                      <Progress
                        value={cp.completion_percent || 0}
                        className="h-2"
                      />
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>
                          {cp.lessons_completed || 0}/{cp.total_lessons || 0}{' '}
                          lecciones
                        </span>
                        <span>
                          {cp.quizzes_completed || 0}/{cp.total_quizzes || 0}{' '}
                          quizzes
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Activity Timeline */}
          <ActivityTimeline studentId={estudianteId} />
        </div>

        {/* Right: Weekly Report */}
        <div>
          <WeeklyReport studentId={estudianteId} />
        </div>
      </div>
    </div>
  )
}
