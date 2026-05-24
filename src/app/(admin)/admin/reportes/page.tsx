import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GRADE_LEVELS } from '@/lib/constants'
import { BarChart3, BookOpen, TrendingUp } from 'lucide-react'

export default async function ReportesAdminPage() {
  const supabase = await createServerSupabaseClient()

  // Real metric: students by grade level
  const { data: students } = await supabase
    .from('profiles')
    .select('grade_level')
    .eq('role', 'estudiante') as { data: { grade_level: string }[] | null; error: any }

  const byGrade: Record<string, number> = {}
  if (students) {
    students.forEach((s) => {
      const gl = s.grade_level || 'sin_nivel'
      byGrade[gl] = (byGrade[gl] || 0) + 1
    })
  }

  const gradeLabels: Record<string, string> = {}
  GRADE_LEVELS.forEach((g) => {
    gradeLabels[g.value] = g.label
  })

  const totalStudents = students?.length || 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reportes</h1>
        <p className="mt-1 text-muted-foreground">
          Analisis y metricas de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Engagement</CardTitle>
            <Badge
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              variant="secondary"
            >
              Proximamente
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <TrendingUp className="h-8 w-8" />
              <p className="text-sm">
                Metricas de uso diario, tiempo promedio de sesion y frecuencia de
                acceso de los estudiantes.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Rendimiento Academico</CardTitle>
            <Badge
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              variant="secondary"
            >
              Proximamente
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <BookOpen className="h-8 w-8" />
              <p className="text-sm">
                Promedios de notas por asignatura, distribucion de resultados y
                areas de mejora.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Funnel de Conversion</CardTitle>
            <Badge
              className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
              variant="secondary"
            >
              Proximamente
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 text-muted-foreground">
              <BarChart3 className="h-8 w-8" />
              <p className="text-sm">
                Analisis del embudo: visitas, registros, matriculas y
                activacion de estudiantes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real metric */}
      <Card>
        <CardHeader>
          <CardTitle>Estudiantes por Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          {totalStudents === 0 ? (
            <p className="text-sm text-muted-foreground">
              Sin estudiantes registrados
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(byGrade)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([grade, count]) => {
                  const pct = (count / totalStudents) * 100
                  return (
                    <div key={grade} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {gradeLabels[grade] || grade.replace('_', ' ')}
                        </span>
                        <span className="text-muted-foreground">
                          {count} ({Math.round(pct)}%)
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
