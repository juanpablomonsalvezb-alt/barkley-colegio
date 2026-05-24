import { Card, CardContent } from '@/components/ui/card'
import { RefreshCw } from 'lucide-react'

export default function RepasoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Repaso</h1>
        <p className="text-muted-foreground mt-1">Refuerza lo aprendido con repetición espaciada</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin tarjetas de repaso</p>
            <p className="text-sm">Las preguntas que falles en los quizzes aparecerán aquí para repasar</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
