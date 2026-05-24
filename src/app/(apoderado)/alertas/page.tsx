import { Card, CardContent } from '@/components/ui/card'
import { Bell } from 'lucide-react'

export default function AlertasPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Alertas</h1>
        <p className="text-muted-foreground mt-1">Notificaciones importantes</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin alertas</p>
            <p className="text-sm">Las notificaciones de progreso y pagos aparecerán aquí</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
