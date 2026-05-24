'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCLP, formatDate } from '@/lib/formatters'
import { CreditCard, Download, Loader2, Banknote, Building2 } from 'lucide-react'

interface Payment {
  id: string
  amount_clp: number
  payment_method: 'transbank' | 'khipu' | 'transferencia_manual'
  payment_status: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado' | 'vencido'
  paid_at: string | null
  due_date: string
  billing_period_start: string
  billing_period_end: string
  pricing_plans?: { name: string } | null
}

interface PaymentHistoryProps {
  payments: Payment[]
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pendiente: { label: 'Pendiente', variant: 'outline' },
  pagado: { label: 'Pagado', variant: 'default' },
  fallido: { label: 'Fallido', variant: 'destructive' },
  reembolsado: { label: 'Reembolsado', variant: 'secondary' },
  vencido: { label: 'Vencido', variant: 'destructive' },
}

const methodLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  transbank: { label: 'Transbank', icon: <CreditCard className="h-4 w-4" /> },
  khipu: { label: 'Khipu', icon: <Banknote className="h-4 w-4" /> },
  transferencia_manual: { label: 'Transferencia', icon: <Building2 className="h-4 w-4" /> },
}

function formatPeriod(start: string, end: string): string {
  const startDate = new Date(start)
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ]
  return `${months[startDate.getMonth()]} ${startDate.getFullYear()}`
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const [loadingPayment, setLoadingPayment] = useState<string | null>(null)

  async function handlePay(paymentId: string) {
    setLoadingPayment(paymentId)
    try {
      const payment = payments.find((p) => p.id === paymentId)
      if (!payment) return

      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payerId: '', // Se obtendra del servidor
          studentId: '',
          planId: '',
          paymentMethod: payment.payment_method,
        }),
      })

      const data = await response.json()

      if (data.url) {
        window.location.href = data.url
      } else if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      }
    } catch (error) {
      console.error('Error al iniciar pago:', error)
    } finally {
      setLoadingPayment(null)
    }
  }

  if (!payments.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <CreditCard className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">No hay pagos registrados</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="pb-3 pr-4 font-medium">Periodo</th>
            <th className="pb-3 pr-4 font-medium">Monto</th>
            <th className="pb-3 pr-4 font-medium">Metodo</th>
            <th className="pb-3 pr-4 font-medium">Estado</th>
            <th className="pb-3 pr-4 font-medium">Fecha Pago</th>
            <th className="pb-3 font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => {
            const status = statusConfig[payment.payment_status] || statusConfig.pendiente
            const method = methodLabels[payment.payment_method] || methodLabels.transbank

            return (
              <tr key={payment.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  <div className="font-medium">
                    {formatPeriod(payment.billing_period_start, payment.billing_period_end)}
                  </div>
                  {payment.pricing_plans && (
                    <div className="text-xs text-muted-foreground">{payment.pricing_plans.name}</div>
                  )}
                </td>
                <td className="py-3 pr-4 font-medium">{formatCLP(payment.amount_clp)}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-1.5">
                    {method.icon}
                    <span>{method.label}</span>
                  </div>
                </td>
                <td className="py-3 pr-4">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </td>
                <td className="py-3 pr-4 text-muted-foreground">
                  {payment.paid_at ? formatDate(payment.paid_at) : '-'}
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    {payment.payment_status === 'pagado' && (
                      <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        Comprobante
                      </Button>
                    )}
                    {(payment.payment_status === 'pendiente' || payment.payment_status === 'vencido') && (
                      <Button
                        size="sm"
                        className="h-8 text-xs"
                        disabled={loadingPayment === payment.id}
                        onClick={() => handlePay(payment.id)}
                      >
                        {loadingPayment === payment.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          'Pagar'
                        )}
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
