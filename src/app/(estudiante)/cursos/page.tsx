import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, GraduationCap } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/estudiante/course-card'

export default async function CursosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let enrolledCourses: any[] = []

  if (user) {
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        id,
        course_id,
        courses (
          id,
          title,
          slug,
          description,
          thumbnail_url,
          total_lessons,
          subjects (
            name,
            color
          )
        )
      `)
      .eq('student_id', user.id)
      .eq('status', 'active')

    if (enrollments) {
      // Fetch progress for each course
      const courseIds = enrollments.map((e: any) => e.course_id)
      const { data: progressData } = await supabase
        .from('course_progress')
        .select('course_id, completed_lessons, completion_percent')
        .eq('student_id', user.id)
        .in('course_id', courseIds.length > 0 ? courseIds : ['none'])

      const progressMap = new Map(
        (progressData || []).map((p: any) => [p.course_id, p])
      )

      enrolledCourses = enrollments.map((e: any) => ({
        course: e.courses,
        subject: e.courses?.subjects || { name: 'General', color: '#3B82F6' },
        progress: progressMap.get(e.course_id),
      }))
    }
  }

  // Group by subject
  const subjects = new Map<string, typeof enrolledCourses>()
  enrolledCourses.forEach((item) => {
    const subjectName = item.subject?.name || 'General'
    if (!subjects.has(subjectName)) subjects.set(subjectName, [])
    subjects.get(subjectName)!.push(item)
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground mt-1">Todas tus asignaturas en un solo lugar</p>
      </div>

      {enrolledCourses.length > 0 ? (
        <>
          {/* Summary */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              {enrolledCourses.length} {enrolledCourses.length === 1 ? 'curso' : 'cursos'} activos
            </Badge>
            {Array.from(subjects.keys()).map((subj) => (
              <Badge key={subj} variant="outline" className="text-xs">
                {subj}
              </Badge>
            ))}
          </div>

          {/* Courses grouped by subject */}
          {Array.from(subjects.entries()).map(([subjectName, courses]) => (
            <div key={subjectName}>
              <h2 className="text-lg font-semibold mb-4">{subjectName}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((item: any) => (
                  <CourseCard
                    key={item.course.id}
                    course={item.course}
                    subject={item.subject}
                    progress={item.progress}
                  />
                ))}
              </div>
            </div>
          ))}
        </>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center text-muted-foreground space-y-3">
              <BookOpen className="h-14 w-14 mx-auto opacity-20" />
              <p className="text-lg font-semibold">No estas matriculado en ningun curso</p>
              <p className="text-sm max-w-sm mx-auto">
                Los cursos apareceran aqui una vez que tu apoderado active tu matricula.
                Contacta a tu apoderado para comenzar.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
