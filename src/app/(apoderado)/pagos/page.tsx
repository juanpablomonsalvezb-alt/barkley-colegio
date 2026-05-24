import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PaymentHistory } from '@/components/apoderado/payment-history'
import { formatCLP, formatDate } from '@/lib/formatters'
import { CreditCard, CalendarClock, AlertTriangle, CheckCircle2 } from 'lucide-react'

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; reason?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Obtener pagos del apoderado
  const { data: payments } = await supabase
    .from('payments')
    .select('*, pricing_plans(name, monthly_price_clp)')
    .eq('payer_id', user.id)
    .order('due_date', { ascending: false })

  const allPayments = payments || []

  // Calcular resumen
  const pendingPayments = allPayments.filter(
    (p) => p.payment_status === 'pendiente' || p.payment_status === 'vencido'
  )
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount_clp, 0)
  const nextPayment = pendingPayments.sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )[0]

  const params = await searchParams
  const status = params?.status
  const reason = params?.reason

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pagos</h1>
        <p className="text-muted-foreground">Gestiona los pagos de mensualidad de tus hijos</p>
      </div>

      {/* Status messages */}
      {status === 'success' && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Pago procesado exitosamente
          </p>
        </div>
      )}
      {status === 'error' && (
        <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            {reason === 'cancelled'
              ? 'Pago cancelado por el usuario'
              : reason === 'rejected'
                ? 'Pago rechazado por el banco'
                : 'Hubo un error procesando tu pago. Intenta nuevamente.'}
          </p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proximo Pago</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextPayment ? (
              <>
                <div className="text-2xl font-bold">{formatDate(nextPayment.due_date)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCLP(nextPayment.amount_clp)}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Sin pagos pendientes</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto Pendiente</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCLP(totalPending)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments.length} pago{pendingPayments.length !== 1 ? 's' : ''} pendiente{pendingPayments.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCLP(
                allPayments
                  .filter((p) => p.payment_status === 'pagado')
                  .reduce((sum, p) => sum + p.amount_clp, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {allPayments.filter((p) => p.payment_status === 'pagado').length} pagos realizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment action */}
      {pendingPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pagar Mensualidad</CardTitle>
            <CardDescription>
              Selecciona un metodo de pago para completar tu mensualidad pendiente
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button className="gap-2">
              <CreditCard className="h-4 w-4" />
              Pagar con Transbank
            </Button>
            <Button variant="outline" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Pagar con Khipu
            </Button>
            <Button variant="secondary" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Transferencia Manual
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de Pagos</CardTitle>
          <CardDescription>Todos los pagos registrados en tu cuenta</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentHistory payments={allPayments} />
        </CardContent>
      </Card>
    </div>
  )
}
