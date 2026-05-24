import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const paymentId = request.nextUrl.searchParams.get('paymentId')

    if (!paymentId) {
      return NextResponse.json({ error: 'paymentId requerido' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Obtener el perfil del usuario para verificar rol
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Obtener el pago
    const { data: payment, error: paymentError } = await admin
      .from('payments')
      .select('*, pricing_plans(name, monthly_price_clp)')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Pago no encontrado' }, { status: 404 })
    }

    // Solo el pagador o un admin pueden consultar
    const isAdmin = profile?.role === 'admin'
    const isPayer = payment.payer_id === user.id

    if (!isAdmin && !isPayer) {
      return NextResponse.json({ error: 'No autorizado para ver este pago' }, { status: 403 })
    }

    return NextResponse.json({
      id: payment.id,
      status: payment.payment_status,
      amount: payment.amount_clp,
      method: payment.payment_method,
      paidAt: payment.paid_at,
      dueDate: payment.due_date,
      billingPeriodStart: payment.billing_period_start,
      billingPeriodEnd: payment.billing_period_end,
      plan: payment.pricing_plans,
    })
  } catch (error) {
    console.error('Error en /api/payments/status:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
