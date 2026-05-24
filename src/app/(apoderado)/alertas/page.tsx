import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertList } from '@/components/apoderado/alert-list'
import { Bell } from 'lucide-react'

export default async function AlertasPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener notificaciones del usuario
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const allNotifications = notifications || []
  const unreadCount = allNotifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alertas</h1>
          <p className="text-muted-foreground">Notificaciones sobre pagos, progreso y logros</p>
        </div>
        {unreadCount > 0 && (
          <Badge variant="default" className="gap-1.5">
            <Bell className="h-3.5 w-3.5" />
            {unreadCount} sin leer
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notificaciones</CardTitle>
          <CardDescription>
            {unreadCount > 0
              ? `Tienes ${unreadCount} notificacion${unreadCount > 1 ? 'es' : ''} sin leer`
              : 'Todas las notificaciones han sido leidas'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertList notifications={allNotifications} />
        </CardContent>
      </Card>
    </div>
  )
}
