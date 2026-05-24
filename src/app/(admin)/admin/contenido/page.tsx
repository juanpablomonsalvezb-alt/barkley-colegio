import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ContenidoAdminPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Gestión de Contenido</h1>
      <Card>
        <CardHeader><CardTitle>Cursos, Lecciones y Quizzes</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Conecta Supabase para gestionar contenido educativo</p></CardContent>
      </Card>
    </div>
  )
}
