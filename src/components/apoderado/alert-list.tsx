'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/formatters'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  TrendingDown,
  Trophy,
  BookOpen,
  Brain,
  ClipboardCheck,
  ShieldCheck,
  Bell,
} from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: string
  data: Record<string, unknown> | null
}

interface AlertListProps {
  notifications: Notification[]
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  pago_pendiente: { icon: <CreditCard className="h-5 w-5" />, color: 'text-amber-500' },
  pago_confirmado: { icon: <CheckCircle2 className="h-5 w-5" />, color: 'text-green-500' },
  pago_fallido: { icon: <XCircle className="h-5 w-5" />, color: 'text-red-500' },
  progreso_bajo: { icon: <TrendingDown className="h-5 w-5" />, color: 'text-orange-500' },
  logro_obtenido: { icon: <Trophy className="h-5 w-5" />, color: 'text-yellow-500' },
  leccion_completada: { icon: <BookOpen className="h-5 w-5" />, color: 'text-blue-500' },
  quiz_completado: { icon: <ClipboardCheck className="h-5 w-5" />, color: 'text-indigo-500' },
  repaso_pendiente: { icon: <Brain className="h-5 w-5" />, color: 'text-purple-500' },
  matricula_aprobada: { icon: <ShieldCheck className="h-5 w-5" />, color: 'text-emerald-500' },
}

const filterTabs = [
  { value: 'todas', label: 'Todas' },
  { value: 'pagos', label: 'Pagos' },
  { value: 'academico', label: 'Academico' },
  { value: 'logros', label: 'Logros' },
]

function getFilterTypes(filter: string): string[] | null {
  switch (filter) {
    case 'pagos':
      return ['pago_pendiente', 'pago_confirmado', 'pago_fallido']
    case 'academico':
      return ['progreso_bajo', 'leccion_completada', 'quiz_completado', 'repaso_pendiente', 'matricula_aprobada']
    case 'logros':
      return ['logro_obtenido']
    default:
      return null
  }
}

export function AlertList({ notifications: initialNotifications }: AlertListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [activeFilter, setActiveFilter] = useState('todas')
  const supabase = createClient()

  async function markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      )
    }
  }

  const filterTypes = getFilterTypes(activeFilter)
  const filtered = filterTypes
    ? notifications.filter((n) => filterTypes.includes(n.type))
    : notifications

  return (
    <Tabs defaultValue="todas" onValueChange={setActiveFilter}>
      <TabsList className="mb-4">
        {filterTabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {filterTabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">No hay alertas en esta categoria</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((notification) => {
                const config = typeConfig[notification.type] || {
                  icon: <Bell className="h-5 w-5" />,
                  color: 'text-muted-foreground',
                }

                return (
                  <button
                    key={notification.id}
                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                    className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50 ${
                      notification.is_read ? 'opacity-60' : 'bg-card'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${config.color}`}>{config.icon}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${notification.is_read ? '' : 'font-semibold'}`}>
                          {notification.title}
                        </p>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
                    </div>
                    {!notification.is_read && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  )
}
