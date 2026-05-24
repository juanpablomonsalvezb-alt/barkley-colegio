'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCLP, formatDate } from '@/lib/formatters'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const STATUS_STYLES: Record<string, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  pagado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  fallido: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  reembolsado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  vencido: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
}

interface PaymentTableProps {
  payments: any[]
}

export function PaymentTable({ payments }: PaymentTableProps) {
  const [items, setItems] = useState(payments)

  async function handleMarkPaid(paymentId: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from('payments')
      .update({ status: 'pagado', paid_at: new Date().toISOString() })
      .eq('id', paymentId)

    if (!error) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === paymentId ? { ...p, status: 'pagado' } : p
        )
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Pagos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-3 pr-4 font-medium">Apoderado</th>
                <th className="pb-3 pr-4 font-medium">Estudiante</th>
                <th className="pb-3 pr-4 font-medium">Monto</th>
                <th className="pb-3 pr-4 font-medium">Metodo</th>
                <th className="pb-3 pr-4 font-medium">Estado</th>
                <th className="pb-3 pr-4 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground">
                    No hay pagos registrados
                  </td>
                </tr>
              ) : (
                items.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">
                      {payment.payer?.full_name || '—'}
                    </td>
                    <td className="py-3 pr-4">
                      {payment.student?.full_name || '—'}
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {formatCLP(payment.amount || 0)}
                    </td>
                    <td className="py-3 pr-4 capitalize">
                      {(payment.payment_method || '—').replace('_', ' ')}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        className={STATUS_STYLES[payment.status] || ''}
                        variant="secondary"
                      >
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">
                      {payment.created_at ? formatDate(payment.created_at) : '—'}
                    </td>
                    <td className="py-3">
                      {payment.status === 'pendiente' &&
                        payment.payment_method === 'transferencia_manual' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkPaid(payment.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Marcar Pagado
                          </Button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
