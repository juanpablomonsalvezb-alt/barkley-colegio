import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { formatCLP } from '@/lib/formatters'
import { Settings, CreditCard, Bell } from 'lucide-react'

export default async function ConfiguracionPage() {
  const supabase = await createServerSupabaseClient()

  const { data: plans } = await supabase
    .from('pricing_plans')
    .select('*')
    .order('price') as { data: any[] | null; error: any }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuracion</h1>
        <p className="mt-1 text-muted-foreground">
          Ajustes generales de la plataforma
        </p>
      </div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">
                Nombre de la plataforma
              </p>
              <p className="font-medium">Barkley</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pais</p>
              <p className="font-medium">Chile</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Moneda</p>
              <p className="font-medium">CLP (Peso Chileno)</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Zona Horaria</p>
              <p className="font-medium">America/Santiago</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Planes de Precio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Planes de Precio
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!plans || plans.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay planes configurados
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Nombre</th>
                    <th className="pb-3 pr-4 font-medium">Precio</th>
                    <th className="pb-3 pr-4 font-medium">Niveles</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan: any) => (
                    <tr key={plan.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{plan.name}</td>
                      <td className="py-3 pr-4 font-mono">
                        {formatCLP(plan.price || 0)}
                        {plan.billing_period && (
                          <span className="text-muted-foreground">
                            {' '}
                            / {plan.billing_period}
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        {plan.grade_levels
                          ? (Array.isArray(plan.grade_levels)
                              ? plan.grade_levels
                              : [plan.grade_levels]
                            )
                              .map((gl: string) => gl.replace('_', ' '))
                              .join(', ')
                          : 'Todos'}
                      </td>
                      <td className="py-3">
                        <Badge
                          className={
                            plan.is_active !== false
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                          }
                          variant="secondary"
                        >
                          {plan.is_active !== false ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notificaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email de nueva matricula</p>
                <p className="text-sm text-muted-foreground">
                  Recibir email cuando un estudiante solicite matricula
                </p>
              </div>
              <Badge
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                variant="secondary"
              >
                Proximamente
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alerta de pago vencido</p>
                <p className="text-sm text-muted-foreground">
                  Notificar cuando un pago pase de la fecha limite
                </p>
              </div>
              <Badge
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                variant="secondary"
              >
                Proximamente
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reporte semanal</p>
                <p className="text-sm text-muted-foreground">
                  Resumen semanal de actividad enviado al email del administrador
                </p>
              </div>
              <Badge
                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                variant="secondary"
              >
                Proximamente
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
