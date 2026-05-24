import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle } from 'lucide-react'

export default function PerfilEstudiantePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground mt-1">Información personal</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Conecta con Supabase para ver tu perfil</p>
        </CardContent>
      </Card>
    </div>
  )
}
