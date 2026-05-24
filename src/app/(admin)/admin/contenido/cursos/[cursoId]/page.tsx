import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Pencil,
  Video,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'

interface Props {
  params: Promise<{ cursoId: string }>
}

const TYPE_ICONS: Record<string, typeof Video> = {
  video: Video,
  texto: FileText,
  mixto: Layers,
}

export default async function CursoDetallePage({ params }: Props) {
  const { cursoId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, subjects(name)')
    .eq('id', cursoId)
    .single() as { data: any; error: any }

  if (!course) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Curso no encontrado</p>
      </div>
    )
  }

  const { data: units } = await supabase
    .from('units')
    .select('*')
    .eq('course_id', cursoId)
    .order('order_index') as { data: any[] | null; error: any }

  const unitIds = (units || []).map((u: any) => u.id)
  let lessons: any[] = []

  if (unitIds.length > 0) {
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .in('unit_id', unitIds)
      .order('order_index') as { data: any[] | null; error: any }
    lessons = lessonsData || []
  }

  const lessonsByUnit: Record<string, any[]> = {}
  lessons.forEach((l: any) => {
    if (!lessonsByUnit[l.unit_id]) lessonsByUnit[l.unit_id] = []
    lessonsByUnit[l.unit_id].push(l)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <div className="mt-1 flex items-center gap-3 text-muted-foreground">
            {course.subjects?.name && <span>{course.subjects.name}</span>}
            {course.grade_level && (
              <span>{course.grade_level.replace('_', ' ')}</span>
            )}
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
        </div>
        <a
          href={`/admin/contenido/cursos/${cursoId}/editar`}
          className={buttonVariants({ variant: 'outline' })}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Editar Curso
        </a>
      </div>

      {course.description && (
        <p className="text-muted-foreground">{course.description}</p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Unidades y Lecciones</h2>
        <Button variant="outline" size="sm">
          <Plus className="mr-1 h-4 w-4" />
          Agregar Unidad
        </Button>
      </div>

      {!units || units.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">No hay unidades creadas</p>
            <p className="text-sm text-muted-foreground">
              Agrega la primera unidad para organizar el contenido
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {units.map((unit: any) => {
            const unitLessons = lessonsByUnit[unit.id] || []
            return (
              <Card key={unit.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    {unit.title || `Unidad ${unit.order_index + 1}`}
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar Leccion
                  </Button>
                </CardHeader>
                <CardContent>
                  {unitLessons.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Sin lecciones en esta unidad
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {unitLessons.map((lesson: any) => {
                        const TypeIcon = TYPE_ICONS[lesson.type] || FileText
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <TypeIcon className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.estimated_minutes || 0} min &middot;
                                  Dificultad {lesson.difficulty || 1}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  lesson.type === 'video'
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                    : lesson.type === 'texto'
                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                                }
                                variant="secondary"
                              >
                                {lesson.type}
                              </Badge>
                              <Badge
                                className={
                                  lesson.is_published
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                                }
                                variant="secondary"
                              >
                                {lesson.is_published ? 'Publicado' : 'Borrador'}
                              </Badge>
                              <a
                                href={`/admin/contenido/cursos/${cursoId}/lecciones/${lesson.id}`}
                                className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                              >
                                <Pencil className="h-3 w-3" />
                              </a>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
