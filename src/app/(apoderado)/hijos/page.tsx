import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { ChildProgressCard } from '@/components/apoderado/child-progress-card'

export default async function HijosPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let children: any[] = []

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, avatar_url')
      .eq('parent_id', user.id)
      .eq('role', 'student')
      .order('created_at', { ascending: true })

    children = data || []
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mis Hijos</h1>
          <p className="text-muted-foreground mt-1">
            {children.length > 0
              ? `${children.length} ${children.length === 1 ? 'estudiante registrado' : 'estudiantes registrados'}`
              : 'Gestiona los estudiantes de tu familia'}
          </p>
        </div>
        <Link href="/registro">
          <Button className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Hijo
          </Button>
        </Link>
      </div>

      {children.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child: any) => (
            <ChildProgressCard
              key={child.id}
              studentId={child.id}
              studentName={`${child.first_name} ${child.last_name}`}
              avatarUrl={child.avatar_url}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-20">
            <div className="text-center text-muted-foreground space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                <Users className="h-8 w-8 opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold">Sin estudiantes registrados</p>
                <p className="text-sm max-w-sm mx-auto">
                  Agrega a tu primer hijo para comenzar a usar Barkley.
                  El proceso toma menos de 2 minutos.
                </p>
              </div>
              <Link href="/registro">
                <Button className="mt-2">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar estudiante
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
