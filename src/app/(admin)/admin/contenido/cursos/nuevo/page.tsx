'use client'

import { useEffect, useState } from 'react'
import { CourseEditor } from '@/components/admin/course-editor'
import { createClient } from '@/lib/supabase/client'
import { Skeleton } from '@/components/ui/skeleton'

export default function NuevoCursoPage() {
  const [subjects, setSubjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSubjects() {
      const supabase = createClient()
      const { data } = await supabase
        .from('subjects')
        .select('*')
        .order('name')
      setSubjects((data as any[]) || [])
      setLoading(false)
    }
    fetchSubjects()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Nuevo Curso</h1>
          <p className="mt-1 text-muted-foreground">Crea un nuevo curso</p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nuevo Curso</h1>
        <p className="mt-1 text-muted-foreground">Crea un nuevo curso</p>
      </div>
      <CourseEditor subjects={subjects} />
    </div>
  )
}
