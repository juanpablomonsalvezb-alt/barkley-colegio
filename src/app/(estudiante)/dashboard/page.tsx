import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Trophy,
  Flame,
  Clock,
  Zap,
  Play,
  ArrowRight,
  RotateCcw,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cn } from '@/lib/utils'

export default async function EstudianteDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = null
  let stats: any = null
  let courseProgress: any[] = []
  let recentLessons: any[] = []
  let pendingReviews = 0

  if (user) {
    const [profileRes, statsRes, cpRes, lpRes, reviewRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('student_stats').select('*').eq('student_id', user.id).single(),
      supabase.from('course_progress').select('*, courses(id, title, slug)').eq('student_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('lesson_progress').select('*, lessons(id, title, unit_id, units(courses(id, title)))').eq('student_id', user.id).order('updated_at', { ascending: false }).limit(1),
      supabase.from('review_items').select('id', { count: 'exact' }).eq('student_id', user.id).lte('next_review_at', new Date().toISOString()),
    ])

    profile = profileRes.data
    stats = statsRes.data
    courseProgress = cpRes.data || []
    recentLessons = lpRes.data || []
    pendingReviews = reviewRes.count || 0
  }

  const firstName = profile?.first_name || 'Estudiante'
  const totalXp = stats?.total_xp || 0
  const currentStreak = stats?.current_streak || 0
  const bestStreak = stats?.best_streak || 0
  const level = Math.floor(totalXp / 500) + 1
  const xpToNext = 500 - (totalXp % 500)
  const xpProgress = ((totalXp % 500) / 500) * 100
  const totalStudyMinutes = stats?.total_study_time_minutes || 0
  const studyHours = Math.floor(totalStudyMinutes / 60)
  const totalLessons = stats?.lessons_completed || 0

  const lastLesson = recentLessons[0]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hola, {firstName}!</h1>
          <p className="text-muted-foreground mt-1">Sigue aprendiendo a tu ritmo</p>
        </div>
        <Badge variant="secondary" className="text-sm px-3 py-1">
          <Zap className="w-3.5 h-3.5 mr-1 text-yellow-500" />
          Nivel {level}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200/50 dark:border-blue-800/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-2xl font-bold">{totalLessons}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Lecciones completadas</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-950/50 dark:to-yellow-900/30 border-yellow-200/50 dark:border-yellow-800/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="text-2xl font-bold">{totalXp.toLocaleString()} XP</p>
            <p className="text-xs text-muted-foreground mt-0.5">{xpToNext} XP para nivel {level + 1}</p>
            <Progress value={xpProgress} className="h-1.5 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200/50 dark:border-orange-800/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Flame className={cn('h-5 w-5', currentStreak > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
            </div>
            <p className="text-2xl font-bold">{currentStreak} dias</p>
            <p className="text-xs text-muted-foreground mt-0.5">Racha actual (mejor: {bestStreak})</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 border-green-200/50 dark:border-green-800/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-2xl font-bold">{studyHours}h</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tiempo de estudio total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Continue Learning - takes 2 cols */}
        <div className="lg:col-span-2 space-y-6">
          {/* Last lesson */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Play className="w-5 h-5 text-blue-600" />
                Continuar Aprendiendo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {lastLesson ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lastLesson.lessons?.title || 'Leccion'}</p>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {(lastLesson.lessons?.units as any)?.courses?.title || 'Curso'}
                    </p>
                  </div>
                  <Link href={`/cursos/${(lastLesson.lessons?.units as any)?.courses?.id}`}>
                    <Button size="sm">
                      Continuar
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-center py-10 text-muted-foreground">
                  <div className="text-center">
                    <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">Sin lecciones recientes</p>
                    <p className="text-sm mt-1">Explora tus cursos para comenzar</p>
                    <Link href="/cursos">
                      <Button variant="outline" size="sm" className="mt-4">
                        Ver mis cursos
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course progress */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Progreso por Curso</CardTitle>
            </CardHeader>
            <CardContent>
              {courseProgress.length > 0 ? (
                <div className="space-y-4">
                  {courseProgress.map((cp: any) => (
                    <Link key={cp.id} href={`/cursos/${cp.courses?.id || cp.course_id}`} className="block">
                      <div className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{cp.courses?.title || 'Curso'}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Progress value={cp.completion_percent || 0} className="h-2 flex-1" />
                            <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                              {Math.round(cp.completion_percent || 0)}%
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No tienes cursos asignados todavia</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pending Reviews */}
          <Card className={cn(pendingReviews > 0 && 'border-amber-300 dark:border-amber-700')}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  pendingReviews > 0
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-muted'
                )}>
                  <RotateCcw className={cn(
                    'w-5 h-5',
                    pendingReviews > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-muted-foreground'
                  )} />
                </div>
                <div>
                  <p className="font-semibold">{pendingReviews} repasos</p>
                  <p className="text-xs text-muted-foreground">pendientes para hoy</p>
                </div>
              </div>
              {pendingReviews > 0 && (
                <Link href="/repaso">
                  <Button size="sm" variant="outline" className="w-full mt-4">
                    Repasar ahora
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements placeholder */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                Logros Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Completa lecciones para desbloquear logros</p>
              </div>
              <Link href="/logros">
                <Button variant="ghost" size="sm" className="w-full">
                  Ver todos los logros
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
