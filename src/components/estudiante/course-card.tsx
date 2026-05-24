'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BookOpen } from 'lucide-react'
import Link from 'next/link'

interface CourseCardProps {
  course: {
    id: string
    title: string
    slug: string
    description: string | null
    thumbnail_url: string | null
    total_lessons: number
  }
  subject: {
    name: string
    color: string | null
  }
  progress?: {
    completed_lessons: number
    completion_percent: number
  }
}

export function CourseCard({ course, subject, progress }: CourseCardProps) {
  return (
    <Link href={`/cursos/${course.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: (subject.color || '#3B82F6') + '20' }}
            >
              <BookOpen className="h-6 w-6" style={{ color: subject.color || '#3B82F6' }} />
            </div>
            <div className="flex-1 min-w-0">
              <Badge
                variant="secondary"
                className="text-xs mb-1.5"
                style={{ color: subject.color || '#3B82F6' }}
              >
                {subject.name}
              </Badge>
              <h3 className="font-bold text-sm truncate">{course.title}</h3>
              {course.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>{progress?.completed_lessons || 0} de {course.total_lessons} lecciones</span>
                  <span>{Math.round(progress?.completion_percent || 0)}%</span>
                </div>
                <Progress value={progress?.completion_percent || 0} className="h-1.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
