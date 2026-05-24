import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'

export default function HijosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Hijos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los estudiantes de tu familia</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Hijo
        </Button>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin estudiantes registrados</p>
            <p className="text-sm">Haz clic en &quot;Agregar Hijo&quot; para registrar un estudiante</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
