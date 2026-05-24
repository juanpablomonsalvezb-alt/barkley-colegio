import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatPercent } from '@/lib/formatters'
import {
  Mail,
  GraduationCap,
  Flame,
  Star,
  BookOpen,
  ClipboardCheck,
  Trophy,
  Zap,
} from 'lucide-react'
import { StudentProfileEditForm } from './student-profile-edit-form'

export default async function PerfilEstudiantePage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener perfil del estudiante
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  // Obtener estadisticas
  const { data: stats } = await supabase
    .from('student_stats')
    .select('*')
    .eq('student_id', user.id)
    .single()

  const studentStats = stats || {
    current_level: 1,
    total_xp: 0,
    current_streak: 0,
    longest_streak: 0,
    total_lessons_completed: 0,
    total_quizzes_completed: 0,
    average_quiz_score: 0,
    total_time_seconds: 0,
  }

  const initials = profile.full_name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const gradeLabels: Record<string, string> = {
    '5_basico': '5to Basico',
    '6_basico': '6to Basico',
    '7_basico': '7mo Basico',
    '8_basico': '8vo Basico',
    '1_medio': '1ro Medio',
    '2_medio': '2do Medio',
    '3_medio': '3ro Medio',
    '4_medio': '4to Medio',
  }

  // XP para siguiente nivel (formula simple: nivel * 1000)
  const xpForNextLevel = studentStats.current_level * 1000
  const xpProgress = Math.min((studentStats.total_xp % 1000) / 10, 100)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Tu informacion y estadisticas de aprendizaje</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.full_name} />
                <AvatarFallback className="text-xl">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{profile.full_name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email}
                </CardDescription>
                {profile.grade_level && (
                  <Badge variant="secondary" className="mt-2">
                    <GraduationCap className="mr-1 h-3.5 w-3.5" />
                    {gradeLabels[profile.grade_level] || profile.grade_level}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Level & XP */}
            <div className="rounded-lg bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">Nivel {studentStats.current_level}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {studentStats.total_xp} / {xpForNextLevel} XP
                </span>
              </div>
              <Progress value={xpProgress} className="mt-2" />
            </div>

            {/* Streak */}
            <div className="mt-4 flex items-center gap-3 rounded-lg border p-4">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{studentStats.current_streak} dias</p>
                <p className="text-xs text-muted-foreground">
                  Racha actual (Mejor: {studentStats.longest_streak} dias)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Editar Datos</CardTitle>
            <CardDescription>Actualiza tu nombre de perfil</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentProfileEditForm
              profileId={profile.id}
              initialName={profile.full_name}
            />
          </CardContent>
        </Card>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lecciones Completadas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.total_lessons_completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quizzes Completados</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentStats.total_quizzes_completed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio Quizzes</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPercent(studentStats.average_quiz_score)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">XP Total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {studentStats.total_xp.toLocaleString('es-CL')}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
