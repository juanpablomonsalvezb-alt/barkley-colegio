'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Flame, Zap, ChevronRight } from 'lucide-react'
import { calculateLevel } from '@/lib/progress/xp-calculator'
import { cn } from '@/lib/utils'

interface ChildProgressCardProps {
  studentId: string
  studentName: string
  avatarUrl?: string | null
}

interface CourseProgressItem {
  id: string
  completion_percent: number
  courses?: { title: string }
}

export function ChildProgressCard({
  studentId,
  studentName,
  avatarUrl,
}: ChildProgressCardProps) {
  const [courseProgress, setCourseProgress] = useState<CourseProgressItem[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchData() {
      try {
        const [cpRes, statsRes] = await Promise.all([
          supabase
            .from('course_progress')
            .select('id, completion_percent, courses(title)')
            .eq('student_id', studentId),
          supabase
            .from('student_stats')
            .select('*')
            .eq('student_id', studentId)
            .single(),
        ])

        setCourseProgress((cpRes.data as unknown as CourseProgressItem[]) || [])
        setStats(statsRes.data)
      } catch (err) {
        console.error('Error fetching child progress:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [studentId])

  const totalXp = stats?.total_xp || 0
  const level = calculateLevel(totalXp)
  const currentStreak = stats?.current_streak || 0
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <Link href={`/hijos/${studentId}`}>
      <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-12 w-12">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={studentName} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold truncate">{studentName}</h3>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary" className="text-xs">
                  Nivel {level}
                </Badge>
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    currentStreak > 0
                      ? 'text-orange-600'
                      : 'text-muted-foreground'
                  )}
                >
                  <Flame
                    className={cn(
                      'h-3 w-3',
                      currentStreak > 0 && 'fill-orange-500'
                    )}
                  />
                  {currentStreak}d
                </div>
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <Zap className="h-3 w-3 fill-yellow-500" />
                  {totalXp.toLocaleString()}
                </div>
              </div>

              {/* Course Progress */}
              {!loading && courseProgress.length > 0 && (
                <div className="mt-3 space-y-2">
                  {courseProgress.slice(0, 3).map((cp) => (
                    <div key={cp.id} className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground truncate max-w-[70%]">
                          {cp.courses?.title || 'Curso'}
                        </span>
                        <span className="text-xs font-medium">
                          {Math.round(cp.completion_percent || 0)}%
                        </span>
                      </div>
                      <Progress
                        value={cp.completion_percent || 0}
                        className="h-1.5"
                      />
                    </div>
                  ))}
                  {courseProgress.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">
                      +{courseProgress.length - 3} cursos mas
                    </p>
                  )}
                </div>
              )}

              {!loading && courseProgress.length === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Sin cursos activos
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
