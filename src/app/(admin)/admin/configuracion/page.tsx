import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ConfiguracionPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Configuración</h1>
      <Card>
        <CardHeader><CardTitle>Configuración de la Plataforma</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Ajustes generales del sistema</p></CardContent>
      </Card>
    </div>
  )
}
