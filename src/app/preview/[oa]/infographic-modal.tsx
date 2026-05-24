'use client'

import { useEffect, useState } from 'react'
import { X, Maximize2, Download } from 'lucide-react'

interface InfographicModalProps {
  src: string
  alt?: string
}

export default function InfographicModal({ src, alt = 'Infografía' }: InfographicModalProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button onClick={() => setOpen(true)} className="block w-full" aria-label="Ampliar infografía">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full transition group-hover:scale-[1.01]" />
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 opacity-0 shadow-md backdrop-blur transition group-hover:opacity-100">
            <Maximize2 className="h-4 w-4" />
          </div>
        </button>
      </div>

      <div className="mt-2 flex gap-2">
        <a
          href={src}
          download
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
        >
          <Download className="h-3.5 w-3.5" /> Descargar imagen
        </a>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setOpen(false)}
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
