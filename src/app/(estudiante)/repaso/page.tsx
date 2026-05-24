'use client'

import { ReviewSession } from '@/components/estudiante/review-session'
import { Brain } from 'lucide-react'

export default function RepasoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          Sesion de Repaso
        </h1>
        <p className="text-muted-foreground mt-1">
          Refuerza lo aprendido con repeticion espaciada. Las tarjetas se adaptan
          a tu nivel de dominio.
        </p>
      </div>

      <ReviewSession />
    </div>
  )
}
