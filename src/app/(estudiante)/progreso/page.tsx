import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

export default function ProgresoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Progreso</h1>
        <p className="text-muted-foreground mt-1">Seguimiento detallado de tu avance</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin datos de progreso</p>
            <p className="text-sm">Completa lecciones para ver tu avance aquí</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
