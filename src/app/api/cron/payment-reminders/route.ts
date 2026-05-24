import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    // Verificar CRON_SECRET
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const admin = createAdminClient()
    const now = new Date()
    const summary = {
      reminders5Days: 0,
      remindersToday: 0,
      reminders3DaysOverdue: 0,
      suspendedEnrollments: 0,
    }

    // Pagos que vencen en 5 dias
    const in5Days = new Date(now)
    in5Days.setDate(in5Days.getDate() + 5)
    const in5DaysStr = in5Days.toISOString().split('T')[0]

    const { data: dueIn5 } = await admin
      .from('payments')
      .select('id, payer_id, amount_clp, due_date')
      .eq('payment_status', 'pendiente')
      .eq('due_date', in5DaysStr)

    if (dueIn5?.length) {
      for (const payment of dueIn5) {
        await admin.from('notifications').insert({
          user_id: payment.payer_id,
          type: 'pago_pendiente',
          title: 'Pago proximo a vencer',
          message: `Tu pago vence en 5 dias. Monto pendiente: $${payment.amount_clp.toLocaleString('es-CL')}.`,
          data: { payment_id: payment.id, due_date: payment.due_date },
        })
      }
      summary.reminders5Days = dueIn5.length
    }

    // Pagos que vencen hoy
    const todayStr = now.toISOString().split('T')[0]

    const { data: dueToday } = await admin
      .from('payments')
      .select('id, payer_id, amount_clp')
      .eq('payment_status', 'pendiente')
      .eq('due_date', todayStr)

    if (dueToday?.length) {
      for (const payment of dueToday) {
        await admin.from('notifications').insert({
          user_id: payment.payer_id,
          type: 'pago_pendiente',
          title: 'Pago vence hoy',
          message: `Tu pago de $${payment.amount_clp.toLocaleString('es-CL')} vence hoy. Evita recargos pagando a tiempo.`,
          data: { payment_id: payment.id },
        })
      }
      summary.remindersToday = dueToday.length
    }

    // Pagos vencidos hace 3 dias
    const overdue3 = new Date(now)
    overdue3.setDate(overdue3.getDate() - 3)
    const overdue3Str = overdue3.toISOString().split('T')[0]

    const { data: overdue3Days } = await admin
      .from('payments')
      .select('id, payer_id, amount_clp')
      .eq('payment_status', 'pendiente')
      .eq('due_date', overdue3Str)

    if (overdue3Days?.length) {
      for (const payment of overdue3Days) {
        await admin.from('notifications').insert({
          user_id: payment.payer_id,
          type: 'pago_pendiente',
          title: 'Pago vencido',
          message: `Tu pago de $${payment.amount_clp.toLocaleString('es-CL')} esta vencido hace 3 dias. Regulariza tu situacion para evitar la suspension.`,
          data: { payment_id: payment.id },
        })
      }
      summary.reminders3DaysOverdue = overdue3Days.length
    }

    // Pagos vencidos hace mas de 15 dias: suspender matricula
    const overdue15 = new Date(now)
    overdue15.setDate(overdue15.getDate() - 15)
    const overdue15Str = overdue15.toISOString().split('T')[0]

    const { data: overduePayments } = await admin
      .from('payments')
      .select('id, payer_id, student_id, amount_clp')
      .eq('payment_status', 'pendiente')
      .lte('due_date', overdue15Str)

    if (overduePayments?.length) {
      for (const payment of overduePayments) {
        // Marcar pago como vencido
        await admin
          .from('payments')
          .update({ payment_status: 'vencido' })
          .eq('id', payment.id)

        // Suspender matricula
        await admin
          .from('enrollments')
          .update({ status: 'suspendida' })
          .eq('student_id', payment.student_id)
          .eq('status', 'activa')

        // Notificar al apoderado
        await admin.from('notifications').insert({
          user_id: payment.payer_id,
          type: 'pago_pendiente',
          title: 'Matricula suspendida por morosidad',
          message: `La matricula ha sido suspendida por pago vencido hace mas de 15 dias. Contacta a administracion para regularizar.`,
          data: { payment_id: payment.id, student_id: payment.student_id },
        })
      }
      summary.suspendedEnrollments = overduePayments.length
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      summary,
    })
  } catch (error) {
    console.error('Error en cron payment-reminders:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
