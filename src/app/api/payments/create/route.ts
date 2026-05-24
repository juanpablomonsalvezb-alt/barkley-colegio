import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createPaymentSchema } from '@/lib/validations/payment'
import { createTransaction } from '@/lib/payments/transbank'
import { createPayment as createKhipuPayment } from '@/lib/payments/khipu'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createPaymentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos invalidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { payerId, studentId, planId, paymentMethod } = parsed.data

    // Verificar que el usuario autenticado es el pagador
    if (user.id !== payerId) {
      return NextResponse.json({ error: 'No autorizado para este pago' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Obtener el plan de precios
    const { data: plan, error: planError } = await admin
      .from('pricing_plans')
      .select('*')
      .eq('id', planId)
      .eq('is_active', true)
      .single()

    if (planError || !plan) {
      return NextResponse.json({ error: 'Plan no encontrado o inactivo' }, { status: 404 })
    }

    // Calcular periodo de facturacion (mes actual)
    const now = new Date()
    const billingStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const billingEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
    const dueDate = new Date(now.getFullYear(), now.getMonth(), 5).toISOString() // Vence el 5 del mes

    // Crear registro de pago
    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .insert({
        payer_id: payerId,
        student_id: studentId,
        plan_id: planId,
        amount_clp: plan.monthly_price_clp,
        payment_method: paymentMethod,
        payment_status: 'pendiente',
        billing_period_start: billingStart,
        billing_period_end: billingEnd,
        due_date: dueDate,
      })
      .select()
      .single()

    if (paymentError || !payment) {
      console.error('Error creando pago:', paymentError)
      return NextResponse.json({ error: 'Error al crear el pago' }, { status: 500 })
    }

    const origin = request.nextUrl.origin

    // Procesar segun metodo de pago
    if (paymentMethod === 'transbank') {
      const buyOrder = payment.id.substring(0, 26) // Max 26 chars para Transbank
      const sessionId = user.id.substring(0, 61) // Max 61 chars
      const returnUrl = `${origin}/api/webhooks/transbank?paymentId=${payment.id}`

      const { url, token } = await createTransaction(buyOrder, sessionId, plan.monthly_price_clp, returnUrl)

      // Guardar token en metadata
      await admin
        .from('payments')
        .update({
          external_transaction_id: token,
          external_payment_url: url,
          payment_metadata: { transbank_token: token },
        })
        .eq('id', payment.id)

      return NextResponse.json({ url, token, paymentId: payment.id })
    }

    if (paymentMethod === 'khipu') {
      const notifyUrl = `${origin}/api/webhooks/khipu`
      const subject = `Mensualidad Barkley - ${plan.name}`

      const { paymentId: khipuPaymentId, paymentUrl } = await createKhipuPayment(
        plan.monthly_price_clp,
        subject,
        notifyUrl
      )

      await admin
        .from('payments')
        .update({
          external_transaction_id: khipuPaymentId,
          external_payment_url: paymentUrl,
          payment_metadata: { khipu_payment_id: khipuPaymentId },
        })
        .eq('id', payment.id)

      return NextResponse.json({ paymentUrl, paymentId: payment.id })
    }

    // transferencia_manual: solo crear el registro
    return NextResponse.json({
      paymentId: payment.id,
      message: 'Pago registrado. Realiza la transferencia y un administrador confirmara el pago.',
    })
  } catch (error) {
    console.error('Error en /api/payments/create:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
