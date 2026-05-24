import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground mt-1">Todas tus asignaturas</p>
      </div>
      <Card>
        <CardContent className="flex items-center justify-center py-16">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Sin cursos activos</p>
            <p className="text-sm">Los cursos aparecerán aquí una vez matriculado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
