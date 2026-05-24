import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StudentTable } from '@/components/admin/student-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, UserX } from 'lucide-react'

export default async function EstudiantesAdminPage() {
  const supabase = await createServerSupabaseClient()

  const { data: students } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'estudiante')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  const all = students || []
  const activos = all.filter((s: any) => s.is_active !== false).length
  const inactivos = all.length - activos

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Estudiantes</h1>
        <p className="mt-1 text-muted-foreground">
          Gestion de estudiantes de la plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Estudiantes
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{all.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activos
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inactivos
            </CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactivos}</div>
          </CardContent>
        </Card>
      </div>

      <StudentTable students={all} />
    </div>
  )
}
