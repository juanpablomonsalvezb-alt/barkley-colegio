import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminPagosPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pagos</h1>
      <Card>
        <CardHeader><CardTitle>Gestión de Pagos</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Conecta Supabase para gestionar pagos</p></CardContent>
      </Card>
    </div>
  )
}
