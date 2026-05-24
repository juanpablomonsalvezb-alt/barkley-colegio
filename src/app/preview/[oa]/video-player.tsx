'use client'

import { Video } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  poster?: string
}

export default function VideoPlayer({ src, poster }: VideoPlayerProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-sm">
      <video
        src={src}
        poster={poster}
        controls
        controlsList="nodownload"
        className="w-full aspect-video"
      >
        <track kind="captions" />
        Tu navegador no soporta video HTML5.
      </video>
    </div>
  )
}

export function VideoPlaceholder() {
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <Video className="h-6 w-6" />
        </div>
        <div className="text-sm font-medium">Video en generación…</div>
        <div className="text-xs text-slate-400">Estará disponible en breve</div>
      </div>
    </div>
  )
}
