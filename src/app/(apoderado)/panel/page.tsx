import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bell, TrendingUp } from 'lucide-react'
import { ChildProgressCard } from '@/components/apoderado/child-progress-card'

export default async function ApoderadoPanel() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Verify user is apoderado
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile as any).role !== 'apoderado') {
    redirect('/login')
  }

  // Fetch children
  const { data: children } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url')
    .eq('parent_id', user.id)
    .eq('is_active', true)

  const childrenList = (children || []) as any[]

  // Fetch recent notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id, title, message, created_at, is_read')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const notificationsList = (notifications || []) as any[]
  const unreadCount = notificationsList.filter((n: any) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Panel de Apoderado</h1>
        <p className="text-muted-foreground mt-1">
          Seguimiento del progreso de tus hijos
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hijos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{childrenList.length}</div>
            <p className="text-xs text-muted-foreground">
              estudiantes registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progreso Promedio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">esta semana</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Alertas
            </CardTitle>
            <Bell className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Children Cards */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Mis Hijos</h2>
        {childrenList.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">
                  No tienes hijos registrados
                </p>
                <p className="text-sm">
                  Ve a &quot;Mis Hijos&quot; para registrar un estudiante
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {childrenList.map((child: any) => (
              <ChildProgressCard
                key={child.id}
                studentId={child.id}
                studentName={child.full_name}
                avatarUrl={child.avatar_url}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recent Notifications */}
      {notificationsList.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Notificaciones Recientes</h2>
          <Card>
            <CardContent className="divide-y p-0">
              {notificationsList.map((notif: any) => (
                <div
                  key={notif.id}
                  className={`p-4 ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notif.message}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}
