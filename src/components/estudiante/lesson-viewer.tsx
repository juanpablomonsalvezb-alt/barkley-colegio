'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, FileText, Download, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface LessonViewerProps {
  lesson: {
    id: string
    title: string
    lesson_type: string
    video_url: string | null
    video_duration_seconds: number | null
    content_html: string | null
    summary_pdf_url: string | null
    estimated_minutes: number
    difficulty_level: number
  }
  quizId: string | null
  courseId: string
  unitId: string
  onVideoWatched?: () => void
  onContentRead?: () => void
}

export function LessonViewer({
  lesson,
  quizId,
  courseId,
  unitId,
  onVideoWatched,
  onContentRead,
}: LessonViewerProps) {
  const [videoWatched, setVideoWatched] = useState(false)
  const [contentRead, setContentRead] = useState(false)

  const handleVideoEnd = () => {
    setVideoWatched(true)
    onVideoWatched?.()
  }

  const handleScrollEnd = () => {
    if (!contentRead) {
      setContentRead(true)
      onContentRead?.()
    }
  }

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/)
    return match?.[1]
  }

  return (
    <div className="space-y-6">
      {/* Video */}
      {lesson.video_url && (lesson.lesson_type === 'video' || lesson.lesson_type === 'mixto') && (
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
              {lesson.video_url.includes('youtube') || lesson.video_url.includes('youtu.be') ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeId(lesson.video_url)}?rel=0`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  onLoad={handleVideoEnd}
                />
              ) : (
                <video
                  src={lesson.video_url}
                  controls
                  className="w-full h-full"
                  onEnded={handleVideoEnd}
                />
              )}
            </div>
            <div className="p-4 flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {lesson.video_duration_seconds
                  ? `${Math.round(lesson.video_duration_seconds / 60)} min`
                  : `${lesson.estimated_minutes} min`}
              </div>
              <Badge variant={videoWatched ? 'default' : 'secondary'}>
                {videoWatched ? '✓ Visto' : 'Sin ver'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Content */}
      {lesson.content_html && (lesson.lesson_type === 'texto' || lesson.lesson_type === 'mixto') && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Material de la Leccion
              </CardTitle>
              <Badge variant={contentRead ? 'default' : 'secondary'}>
                {contentRead ? '✓ Leido' : 'Sin leer'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: lesson.content_html }}
              onScroll={handleScrollEnd}
            />
            {!contentRead && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setContentRead(true)
                  onContentRead?.()
                }}
              >
                Marcar como leido
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* PDF Download */}
      {lesson.summary_pdf_url && (
        <Card>
          <CardContent className="py-4">
            <a
              href={lesson.summary_pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span className="font-medium">Descargar resumen PDF</span>
            </a>
          </CardContent>
        </Card>
      )}

      {/* Quiz CTA */}
      <Separator />
      {quizId ? (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Listo para el quiz?</h3>
                <p className="text-sm text-muted-foreground">
                  Pon a prueba lo que aprendiste en esta leccion
                </p>
              </div>
              <Link href={`/cursos/${courseId}/${unitId}/${lesson.id}/quiz`}>
                <Button size="lg">
                  Comenzar Quiz
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="py-6 text-center">
            <p className="font-medium text-green-700">
              Leccion sin quiz — Continua a la siguiente leccion
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
