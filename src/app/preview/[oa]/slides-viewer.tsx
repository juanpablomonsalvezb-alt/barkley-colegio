'use client'

import { Download, Maximize2 } from 'lucide-react'

interface SlidesViewerProps {
  url: string
}

export default function SlidesViewer({ url }: SlidesViewerProps) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
        <iframe src={`${url}#view=FitH`} className="h-[600px] w-full" title="Slides" />
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
        >
          <Maximize2 className="h-3.5 w-3.5" /> Pantalla completa
        </a>
        <a
          href={url}
          download
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
        >
          <Download className="h-3.5 w-3.5" /> Descargar PDF
        </a>
      </div>
    </div>
  )
}
