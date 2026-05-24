import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, ChevronRight, Lock } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CursoDetailPage({
  params,
}: {
  params: Promise<{ cursoId: string }>
}) {
  const { cursoId } = await params
  const supabase = await createServerSupabaseClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*, subjects(*)')
    .eq('id', cursoId)
    .single()

  if (!course) return notFound()

  const { data: units } = await supabase
    .from('units')
    .select('*, lessons(id, title, slug, lesson_type, estimated_minutes, is_published, display_order)')
    .eq('course_id', cursoId)
    .eq('is_published', true)
    .order('display_order')

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="mb-2">
          {(course as any).subjects?.name}
        </Badge>
        <h1 className="text-3xl font-bold">{(course as any).title}</h1>
        {(course as any).description && (
          <p className="text-muted-foreground mt-2">{(course as any).description}</p>
        )}
      </div>

      {/* Units */}
      <div className="space-y-4">
        {(units || []).map((unit: any, unitIdx: number) => (
          <Card key={unit.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Unidad {unitIdx + 1}: {unit.title}
              </CardTitle>
              {unit.description && (
                <p className="text-sm text-muted-foreground">{unit.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-1">
              {(unit.lessons || [])
                .sort((a: any, b: any) => a.display_order - b.display_order)
                .map((lesson: any, lessonIdx: number) => (
                <Link
                  key={lesson.id}
                  href={`/cursos/${cursoId}/${unit.id}/${lesson.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700">
                    {lessonIdx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.estimated_minutes} min - {lesson.lesson_type}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}

        {(!units || units.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p>Este curso aun no tiene contenido publicado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
