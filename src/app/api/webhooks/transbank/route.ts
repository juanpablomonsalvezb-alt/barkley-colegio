import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { commitTransaction } from '@/lib/payments/transbank'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const tokenWs = formData.get('token_ws') as string | null
    const paymentId = request.nextUrl.searchParams.get('paymentId')

    // Si no hay token, el usuario aborto el pago
    if (!tokenWs) {
      const tbkToken = formData.get('TBK_TOKEN') as string | null
      if (tbkToken) {
        // Usuario aborto en el formulario de pago
        if (paymentId) {
          const admin = createAdminClient()
          await admin
            .from('payments')
            .update({ payment_status: 'fallido', payment_metadata: { abort_reason: 'user_cancelled' } })
            .eq('id', paymentId)
        }
      }
      return NextResponse.redirect(new URL('/pagos?status=error&reason=cancelled', request.nextUrl.origin))
    }

    if (!paymentId) {
      return NextResponse.redirect(new URL('/pagos?status=error&reason=missing_payment', request.nextUrl.origin))
    }

    const admin = createAdminClient()

    // Confirmar la transaccion con Transbank
    const tbkResponse = await commitTransaction(tokenWs)

    if (tbkResponse.response_code === 0 && tbkResponse.status === 'AUTHORIZED') {
      // Pago exitoso
      const now = new Date().toISOString()

      await admin
        .from('payments')
        .update({
          payment_status: 'pagado',
          paid_at: now,
          external_transaction_id: tbkResponse.authorization_code,
          payment_metadata: {
            transbank_response: tbkResponse,
            card_number: tbkResponse.card_detail.card_number,
            authorization_code: tbkResponse.authorization_code,
          },
        })
        .eq('id', paymentId)

      // Obtener datos del pago para activar matricula
      const { data: payment } = await admin
        .from('payments')
        .select('student_id, payer_id')
        .eq('id', paymentId)
        .single()

      if (payment) {
        // Activar matricula del estudiante
        await admin
          .from('enrollments')
          .update({ status: 'activa', enrolled_at: now })
          .eq('student_id', payment.student_id)
          .eq('status', 'pendiente')

        // Crear notificacion para el apoderado
        await admin.from('notifications').insert({
          user_id: payment.payer_id,
          type: 'pago_confirmado',
          title: 'Pago confirmado',
          message: `Tu pago ha sido procesado exitosamente. Codigo de autorizacion: ${tbkResponse.authorization_code}`,
          data: { payment_id: paymentId, authorization_code: tbkResponse.authorization_code },
        })
      }

      return NextResponse.redirect(new URL('/pagos?status=success', request.nextUrl.origin))
    }

    // Pago fallido
    await admin
      .from('payments')
      .update({
        payment_status: 'fallido',
        payment_metadata: { transbank_response: tbkResponse },
      })
      .eq('id', paymentId)

    // Obtener payer_id para notificacion
    const { data: failedPayment } = await admin
      .from('payments')
      .select('payer_id')
      .eq('id', paymentId)
      .single()

    if (failedPayment) {
      await admin.from('notifications').insert({
        user_id: failedPayment.payer_id,
        type: 'pago_fallido',
        title: 'Pago rechazado',
        message: 'Tu pago no pudo ser procesado. Por favor intenta nuevamente o usa otro medio de pago.',
        data: { payment_id: paymentId },
      })
    }

    return NextResponse.redirect(new URL('/pagos?status=error&reason=rejected', request.nextUrl.origin))
  } catch (error) {
    console.error('Error en webhook Transbank:', error)
    return NextResponse.redirect(new URL('/pagos?status=error&reason=internal', request.nextUrl.origin))
  }
}

// Transbank tambien puede enviar GET en algunos flujos de redireccion
export async function GET(request: NextRequest) {
  return POST(request)
}
