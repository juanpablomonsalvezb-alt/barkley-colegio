'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface CourseProgress {
  id: string
  student_id: string
  course_id: string
  lessons_completed: number
  total_lessons: number
  quizzes_completed: number
  total_quizzes: number
  completion_percent: number
  last_activity_at: string | null
  course_title?: string
  course_subject?: string
}

interface UseProgressReturn {
  courseProgress: CourseProgress[]
  loading: boolean
  error: Error | null
}

export function useProgress(): UseProgressReturn {
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProgress() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError) throw authError
        if (!user) {
          setLoading(false)
          return
        }

        const { data, error: queryError } = await supabase
          .from('course_progress')
          .select('*')
          .eq('student_id', user.id)

        if (queryError) throw queryError
        setCourseProgress((data as CourseProgress[]) || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()

    // Subscribe to realtime changes
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function subscribe() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      channel = supabase
        .channel('course_progress_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'course_progress',
            filter: `student_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setCourseProgress((prev) => [...prev, payload.new as CourseProgress])
            } else if (payload.eventType === 'UPDATE') {
              setCourseProgress((prev) =>
                prev.map((p) =>
                  p.id === (payload.new as CourseProgress).id
                    ? (payload.new as CourseProgress)
                    : p
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setCourseProgress((prev) =>
                prev.filter((p) => p.id !== (payload.old as CourseProgress).id)
              )
            }
          }
        )
        .subscribe()
    }

    subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return { courseProgress, loading, error }
}
