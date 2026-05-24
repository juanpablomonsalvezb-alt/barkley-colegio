'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatRelativeTime } from '@/lib/formatters'
import { BookOpen, FileCheck, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityTimelineProps {
  studentId: string
}

interface TimelineItem {
  type: 'lesson' | 'quiz'
  title: string
  score?: number
  created_at: string
}

export function ActivityTimeline({ studentId }: ActivityTimelineProps) {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchActivity() {
      try {
        const [lessonsRes, quizzesRes] = await Promise.all([
          supabase
            .from('lesson_progress')
            .select('completed_at, lessons(title)')
            .eq('student_id', studentId)
            .eq('is_completed', true)
            .order('completed_at', { ascending: false })
            .limit(10),
          supabase
            .from('quiz_attempts')
            .select('score_percent, created_at, quizzes(title)')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false })
            .limit(10),
        ])

        const lessonItems: TimelineItem[] = (
          (lessonsRes.data as any[]) || []
        ).map((l: any) => ({
          type: 'lesson' as const,
          title: l.lessons?.title || 'Leccion',
          created_at: l.completed_at,
        }))

        const quizItems: TimelineItem[] = (
          (quizzesRes.data as any[]) || []
        ).map((q: any) => ({
          type: 'quiz' as const,
          title: q.quizzes?.title || 'Quiz',
          score: q.score_percent,
          created_at: q.created_at,
        }))

        // Merge and sort by date
        const merged = [...lessonItems, ...quizItems]
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
          .slice(0, 10)

        setItems(merged)
      } catch (err) {
        console.error('Error fetching activity:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [studentId])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Actividad Reciente
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Sin actividad reciente
          </p>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 relative">
                  {/* Icon */}
                  <div
                    className={cn(
                      'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      item.type === 'lesson'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-green-100 text-green-600'
                    )}
                  >
                    {item.type === 'lesson' ? (
                      <BookOpen className="h-4 w-4" />
                    ) : (
                      <FileCheck className="h-4 w-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-sm">
                      {item.type === 'lesson' ? (
                        <>
                          Completo{' '}
                          <span className="font-medium">{item.title}</span>
                        </>
                      ) : (
                        <>
                          Quiz{' '}
                          <span className="font-medium">{item.title}</span>
                          {item.score !== undefined && (
                            <span
                              className={cn(
                                'ml-1 font-semibold',
                                item.score >= 80
                                  ? 'text-green-600'
                                  : item.score >= 50
                                    ? 'text-orange-600'
                                    : 'text-red-600'
                              )}
                            >
                              {item.score}%
                            </span>
                          )}
                        </>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
