import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PaymentTable } from '@/components/admin/payment-table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCLP } from '@/lib/formatters'
import { DollarSign, Clock, AlertTriangle } from 'lucide-react'

export default async function AdminPagosPage() {
  const supabase = await createServerSupabaseClient()

  const { data: payments } = await supabase
    .from('payments')
    .select('*, payer:payer_id(full_name), student:student_id(full_name)')
    .order('created_at', { ascending: false }) as { data: any[] | null; error: any }

  const all = payments || []

  const totalRecaudado = all
    .filter((p: any) => p.status === 'pagado')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  const totalPendiente = all
    .filter((p: any) => p.status === 'pendiente')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  const totalVencido = all
    .filter((p: any) => p.status === 'vencido')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0)

  const summaryCards = [
    {
      label: 'Total Recaudado',
      value: formatCLP(totalRecaudado),
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
    },
    {
      label: 'Pendiente',
      value: formatCLP(totalPendiente),
      icon: Clock,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    },
    {
      label: 'Vencido',
      value: formatCLP(totalVencido),
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pagos</h1>
        <p className="mt-1 text-muted-foreground">
          Control de pagos y facturacion
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
                <div className={`rounded-lg p-2 ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <PaymentTable payments={all} />
    </div>
  )
}
