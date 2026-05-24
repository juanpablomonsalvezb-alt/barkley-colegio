import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ReportesAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reportes</h1>
      <Card>
        <CardHeader><CardTitle>Analytics y Métricas</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Conecta Supabase para ver reportes</p></CardContent>
      </Card>
    </div>
  )
}
