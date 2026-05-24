import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { Plus, BookOpen, Layers } from 'lucide-react'

export default async function ContenidoAdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*, subjects(name, slug)')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  // Get lesson counts per course
  const courseIds = (courses || []).map((c: any) => c.id)
  let lessonCounts: Record<string, number> = {}

  if (courseIds.length > 0) {
    const { data: units } = await supabase
      .from('units')
      .select('id, course_id')
      .in('course_id', courseIds) as { data: any[] | null; error: any }

    if (units && units.length > 0) {
      const unitIds = units.map((u: any) => u.id)
      const { data: lessons } = await supabase
        .from('lessons')
        .select('id, unit_id')
        .in('unit_id', unitIds) as { data: any[] | null; error: any }

      const unitToCourse: Record<string, string> = {}
      units.forEach((u: any) => {
        unitToCourse[u.id] = u.course_id
      })

      if (lessons) {
        lessons.forEach((l: any) => {
          const courseId = unitToCourse[l.unit_id]
          if (courseId) {
            lessonCounts[courseId] = (lessonCounts[courseId] || 0) + 1
          }
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contenido</h1>
          <p className="mt-1 text-muted-foreground">
            Gestiona cursos, unidades y lecciones
          </p>
        </div>
        <a
          href="/admin/contenido/cursos/nuevo"
          className={buttonVariants()}
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Curso
        </a>
      </div>

      {!courses || courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No hay cursos creados</p>
            <p className="text-sm text-muted-foreground">
              Crea tu primer curso para comenzar
            </p>
            <a
              href="/admin/contenido/cursos/nuevo"
              className={buttonVariants() + ' mt-4'}
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear Curso
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course: any) => (
            <a
              key={course.id}
              href={`/admin/contenido/cursos/${course.id}`}
              className="group"
            >
              <Card className="transition-shadow hover:ring-2 hover:ring-primary/20">
                {course.thumbnail_url && (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="h-40 w-full object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="line-clamp-2">
                      {course.title}
                    </CardTitle>
                    <Badge
                      className={
                        course.is_published
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                      }
                      variant="secondary"
                    >
                      {course.is_published ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {course.subjects?.name && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.subjects.name}
                      </span>
                    )}
                    {course.grade_level && (
                      <span>{course.grade_level.replace('_', ' ')}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {lessonCounts[course.id] || 0} lecciones
                    </span>
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
