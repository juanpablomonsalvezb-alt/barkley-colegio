import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard } from 'lucide-react'

export default function PagosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="text-muted-foreground mt-1">Historial y pagos pendientes</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin pagos registrados</p>
            <p className="text-sm">Los pagos aparecerán aquí una vez matriculado un estudiante</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
