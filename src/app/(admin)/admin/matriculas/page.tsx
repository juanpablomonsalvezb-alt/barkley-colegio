import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function MatriculasPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Matrículas</h1>
      <Card>
        <CardHeader><CardTitle>Gestión de Matrículas</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Conecta Supabase para gestionar matrículas</p></CardContent>
      </Card>
    </div>
  )
}
