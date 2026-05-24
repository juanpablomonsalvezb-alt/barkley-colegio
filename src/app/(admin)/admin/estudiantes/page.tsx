import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EstudiantesAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Estudiantes</h1>
      <Card>
        <CardHeader><CardTitle>Gestión de Estudiantes</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Conecta Supabase para gestionar estudiantes</p></CardContent>
      </Card>
    </div>
  )
}
