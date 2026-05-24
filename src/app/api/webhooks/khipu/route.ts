import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPayment } from '@/lib/payments/khipu'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const formData = !body ? await request.formData().catch(() => null) : null

    const notificationToken = body?.notification_token ||
      body?.payment_id ||
      formData?.get('notification_token') ||
      formData?.get('payment_id')

    if (!notificationToken) {
      return NextResponse.json({ error: 'notification_token requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Verificar el pago con Khipu
    const khipuStatus = await verifyPayment(notificationToken as string)

    // Buscar el pago en nuestra base de datos por external_transaction_id
    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .select('*')
      .eq('external_transaction_id', notificationToken)
      .single()

    if (paymentError || !payment) {
      console.error('Pago no encontrado para Khipu notification:', notificationToken)
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    if (khipuStatus.status === 'done') {
      const now = new Date().toISOString()

      // Actualizar pago como exitoso
      await admin
        .from('payments')
        .update({
          payment_status: 'pagado',
          paid_at: now,
          payment_metadata: {
            khipu_status: khipuStatus,
            transaction_id: khipuStatus.transaction_id,
          },
        })
        .eq('id', payment.id)

      // Activar matricula
      await admin
        .from('enrollments')
        .update({ status: 'activa', enrolled_at: now })
        .eq('student_id', payment.student_id)
        .eq('status', 'pendiente')

      // Notificar al apoderado
      await admin.from('notifications').insert({
        user_id: payment.payer_id,
        type: 'pago_confirmado',
        title: 'Pago confirmado via Khipu',
        message: 'Tu transferencia bancaria ha sido verificada exitosamente.',
        data: { payment_id: payment.id },
      })

      return NextResponse.json({ success: true, status: 'pagado' })
    }

    if (khipuStatus.status === 'reversed') {
      await admin
        .from('payments')
        .update({
          payment_status: 'reembolsado',
          payment_metadata: { khipu_status: khipuStatus },
        })
        .eq('id', payment.id)

      return NextResponse.json({ success: true, status: 'reembolsado' })
    }

    // Estado pendiente o verificando - no hacer nada aun
    return NextResponse.json({ success: true, status: khipuStatus.status })
  } catch (error) {
    console.error('Error en webhook Khipu:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
