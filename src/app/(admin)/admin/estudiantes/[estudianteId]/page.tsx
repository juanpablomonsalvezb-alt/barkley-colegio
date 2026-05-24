import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { formatCLP, formatDate, formatPercent, formatRut } from '@/lib/formatters'
import {
  User,
  BookOpen,
  Trophy,
  CreditCard,
  Calendar,
  Mail,
  MapPin,
  GraduationCap,
} from 'lucide-react'

interface Props {
  params: Promise<{ estudianteId: string }>
}

export default async function EstudianteDetallePage({ params }: Props) {
  const { estudianteId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', estudianteId)
    .single() as { data: any; error: any }

  const { data: courseProgress } = await supabase
    .from('course_progress')
    .select('*, courses(title, subject_id)')
    .eq('student_id', estudianteId) as { data: any[] | null; error: any }

  const { data: studentStats } = await supabase
    .from('student_stats')
    .select('*')
    .eq('student_id', estudianteId)
    .single() as { data: any; error: any }

  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes(title)')
    .eq('student_id', estudianteId)
    .order('created_at', { ascending: false })
    .limit(10) as { data: any[] | null; error: any }

  const { data: enrollment } = await supabase
    .from('enrollments')
    .select('*, pricing_plans:plan_id(name, price)')
    .eq('student_id', estudianteId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single() as { data: any; error: any }

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('student_id', estudianteId)
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  if (!student) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Estudiante no encontrado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{student.full_name || 'Estudiante'}</h1>
        <p className="mt-1 text-muted-foreground">Detalle del estudiante</p>
      </div>

      {/* Info Personal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informacion Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-medium">{student.full_name || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{student.email || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nivel</p>
                <p className="font-medium">{student.grade_level || '—'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">RUT</p>
                <p className="font-medium font-mono">
                  {student.rut ? formatRut(student.rut) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Registrado</p>
                <p className="font-medium">
                  {student.created_at ? formatDate(student.created_at) : '—'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estado</p>
              <Badge
                className={
                  student.is_active !== false
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                }
                variant="secondary"
              >
                {student.is_active !== false ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progreso Academico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Progreso Academico
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!courseProgress || courseProgress.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin progreso registrado
            </p>
          ) : (
            <div className="space-y-4">
              {courseProgress.map((cp: any) => (
                <div key={cp.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {cp.courses?.title || 'Curso'}
                    </h4>
                    <span className="text-sm font-medium">
                      {formatPercent(cp.progress_percent || 0)}
                    </span>
                  </div>
                  <Progress
                    value={cp.progress_percent || 0}
                    className="mt-2 h-2"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {cp.completed_lessons || 0} / {cp.total_lessons || 0}{' '}
                    lecciones completadas
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Estadisticas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Estadisticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!studentStats ? (
              <p className="text-sm text-muted-foreground">
                Sin estadisticas disponibles
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">XP Total</p>
                  <p className="text-xl font-bold">
                    {(studentStats.total_xp || 0).toLocaleString('es-CL')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Racha Actual</p>
                  <p className="text-xl font-bold">
                    {studentStats.current_streak || 0} dias
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Quizzes Completados
                  </p>
                  <p className="text-xl font-bold">
                    {studentStats.quizzes_completed || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Promedio Quizzes
                  </p>
                  <p className="text-xl font-bold">
                    {formatPercent(studentStats.avg_quiz_score || 0)}
                  </p>
                </div>
              </div>
            )}

            {quizAttempts && quizAttempts.length > 0 && (
              <>
                <Separator className="my-4" />
                <h4 className="mb-3 text-sm font-medium">
                  Ultimos Intentos de Quiz
                </h4>
                <div className="space-y-2">
                  {quizAttempts.map((attempt: any) => (
                    <div
                      key={attempt.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{attempt.quizzes?.title || 'Quiz'}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {attempt.score != null ? `${attempt.score}%` : '—'}
                        </span>
                        <Badge
                          className={
                            attempt.passed
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }
                          variant="secondary"
                        >
                          {attempt.passed ? 'Aprobado' : 'Reprobado'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Historial de Pagos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Historial de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {enrollment && (
              <div className="mb-4 rounded-lg bg-muted/50 p-3">
                <p className="text-sm text-muted-foreground">Plan Actual</p>
                <p className="font-medium">
                  {enrollment.pricing_plans?.name || '—'}
                </p>
                {enrollment.pricing_plans?.price && (
                  <p className="text-sm text-muted-foreground">
                    {formatCLP(enrollment.pricing_plans.price)} / mes
                  </p>
                )}
              </div>
            )}

            {!payments || payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Sin pagos registrados
              </p>
            ) : (
              <div className="space-y-2">
                {payments.map((payment: any) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-mono font-medium">
                        {formatCLP(payment.amount || 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {payment.created_at
                          ? formatDate(payment.created_at)
                          : '—'}
                      </p>
                    </div>
                    <Badge
                      className={
                        payment.status === 'pagado'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : payment.status === 'pendiente'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }
                      variant="secondary"
                    >
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
