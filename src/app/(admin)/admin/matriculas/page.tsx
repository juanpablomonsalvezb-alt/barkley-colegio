import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EnrollmentTable } from '@/components/admin/enrollment-table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default async function MatriculasPage() {
  const supabase = await createServerSupabaseClient()

  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('*, profiles:student_id(full_name, grade_level), pricing_plans:plan_id(name)')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  const all = enrollments || []
  const pendientes = all.filter((e: any) => e.status === 'pendiente')
  const activas = all.filter((e: any) => e.status === 'activa')
  const suspendidas = all.filter((e: any) => e.status === 'suspendida')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Matriculas</h1>
        <p className="mt-1 text-muted-foreground">
          Gestiona las matriculas de los estudiantes
        </p>
      </div>

      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">
            Todas ({all.length})
          </TabsTrigger>
          <TabsTrigger value="pendientes">
            Pendientes ({pendientes.length})
          </TabsTrigger>
          <TabsTrigger value="activas">
            Activas ({activas.length})
          </TabsTrigger>
          <TabsTrigger value="suspendidas">
            Suspendidas ({suspendidas.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="todas">
          <EnrollmentTable enrollments={all} />
        </TabsContent>
        <TabsContent value="pendientes">
          <EnrollmentTable enrollments={pendientes} />
        </TabsContent>
        <TabsContent value="activas">
          <EnrollmentTable enrollments={activas} />
        </TabsContent>
        <TabsContent value="suspendidas">
          <EnrollmentTable enrollments={suspendidas} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
