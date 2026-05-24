// TODO: Replace with real Khipu API SDK when credentials are available
// npm install khipu-client

export type KhipuPaymentStatusType = 'pending' | 'verifying' | 'done' | 'reversed'

export interface KhipuPaymentStatus {
  payment_id: string
  payment_url: string
  simplified_transfer_url: string
  transfer_url: string
  app_url: string
  ready_for_terminal: boolean
  subject: string
  amount: number
  currency: string
  status: KhipuPaymentStatusType
  status_detail: string
  body: string
  receipt_url: string | null
  return_url: string | null
  cancel_url: string | null
  notify_url: string | null
  payer_name: string | null
  payer_email: string | null
  transaction_id: string | null
  custom: string | null
}

const KHIPU_RECEIVER_ID = process.env.KHIPU_RECEIVER_ID || ''
const KHIPU_SECRET = process.env.KHIPU_SECRET || ''

/**
 * Crea un pago en Khipu (transferencia bancaria).
 * En modo stub, simula la respuesta.
 */
export async function createPayment(
  amount: number,
  subject: string,
  notifyUrl: string
): Promise<{ paymentId: string; paymentUrl: string }> {
  // TODO: Replace with real Khipu API call:
  // const client = new Khipu(KHIPU_RECEIVER_ID, KHIPU_SECRET)
  // const response = await client.payments.create({ amount, currency: 'CLP', subject, notify_url: notifyUrl })
  // return { paymentId: response.payment_id, paymentUrl: response.payment_url }

  console.log(`[Khipu Stub] createPayment: receiverId=${KHIPU_RECEIVER_ID}`)
  console.log(`[Khipu Stub] amount=${amount}, subject=${subject}`)

  await new Promise((resolve) => setTimeout(resolve, 300))

  const stubPaymentId = `KHIPU_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

  return {
    paymentId: stubPaymentId,
    paymentUrl: `https://khipu.com/payment/info/${stubPaymentId}`,
  }
}

/**
 * Verifica el estado de un pago en Khipu.
 * En modo stub, simula un pago completado.
 */
export async function verifyPayment(paymentId: string): Promise<KhipuPaymentStatus> {
  // TODO: Replace with real Khipu API call:
  // const client = new Khipu(KHIPU_RECEIVER_ID, KHIPU_SECRET)
  // return await client.payments.get(paymentId)

  console.log(`[Khipu Stub] verifyPayment: paymentId=${paymentId}`)

  await new Promise((resolve) => setTimeout(resolve, 200))

  const response: KhipuPaymentStatus = {
    payment_id: paymentId,
    payment_url: `https://khipu.com/payment/info/${paymentId}`,
    simplified_transfer_url: `https://app.khipu.com/payment/simplified/${paymentId}`,
    transfer_url: `https://app.khipu.com/payment/transfer/${paymentId}`,
    app_url: `khipu:///pos/${paymentId}`,
    ready_for_terminal: false,
    subject: 'Pago mensualidad Barkley',
    amount: 0,
    currency: 'CLP',
    status: 'done',
    status_detail: 'normal',
    body: '',
    receipt_url: null,
    return_url: null,
    cancel_url: null,
    notify_url: null,
    payer_name: null,
    payer_email: null,
    transaction_id: `TXN_${Date.now()}`,
    custom: null,
  }

  return response
}
