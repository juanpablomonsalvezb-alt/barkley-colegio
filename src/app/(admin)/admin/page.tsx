import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { StatsOverview } from '@/components/admin/stats-overview'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { formatDate } from '@/lib/formatters'
import {
  GraduationCap,
  CreditCard,
  Users,
  FileText,
  ArrowRight,
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: { role: string } | null; error: any }

  if (profile?.role !== 'admin') redirect('/login')

  // Fetch stats
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'estudiante')
    .eq('is_active', true)

  const { count: activeEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth)

  const { data: paymentsData } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'pagado')
    .gte('created_at', startOfMonth) as { data: { amount: number }[] | null; error: any }

  const monthlyRevenue = (paymentsData || []).reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  )

  const { count: totalEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })

  const { count: cancelledEnrollments } = await supabase
    .from('enrollments')
    .select('*', { count: 'exact', head: true })
    .in('status', ['cancelada', 'suspendida'])

  const desertion =
    totalEnrollments && totalEnrollments > 0
      ? ((cancelledEnrollments || 0) / totalEnrollments) * 100
      : 0

  // Recent pending enrollments
  const { data: recentEnrollments } = await supabase
    .from('enrollments')
    .select('*, profiles:student_id(full_name, grade_level)')
    .eq('status', 'pendiente')
    .order('created_at', { ascending: false })
    .limit(5) as { data: any[] | null; error: any }

  const quickActions = [
    {
      label: 'Matriculas',
      href: '/admin/matriculas',
      icon: GraduationCap,
      color: 'text-green-500',
    },
    {
      label: 'Pagos',
      href: '/admin/pagos',
      icon: CreditCard,
      color: 'text-purple-500',
    },
    {
      label: 'Estudiantes',
      href: '/admin/estudiantes',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      label: 'Contenido',
      href: '/admin/contenido',
      icon: FileText,
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel Administrativo</h1>
        <p className="mt-1 text-muted-foreground">
          Vista general de la plataforma
        </p>
      </div>

      <StatsOverview
        totalStudents={totalStudents || 0}
        activeEnrollments={activeEnrollments || 0}
        monthlyRevenue={monthlyRevenue}
        desertion={desertion}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Matriculas Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            {!recentEnrollments || recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No hay matriculas pendientes
              </p>
            ) : (
              <div className="space-y-3">
                {recentEnrollments.map((enrollment: any) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {enrollment.profiles?.full_name || '—'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.profiles?.grade_level || '—'} &middot;{' '}
                        {enrollment.created_at
                          ? formatDate(enrollment.created_at)
                          : ''}
                      </p>
                    </div>
                    <Badge
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      variant="secondary"
                    >
                      Pendiente
                    </Badge>
                  </div>
                ))}
                <a
                  href="/admin/matriculas"
                  className={buttonVariants({ variant: 'link' }) + ' px-0'}
                >
                  Ver todas <ArrowRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rapidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <a
                    key={action.href}
                    href={action.href}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                  >
                    <Icon className={`h-5 w-5 ${action.color}`} />
                    <span className="text-sm font-medium">{action.label}</span>
                  </a>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
