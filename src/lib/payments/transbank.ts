// TODO: Replace with real transbank-sdk when credentials are available
// npm install transbank-sdk

export type TransbankStatus = 'AUTHORIZED' | 'FAILED' | 'NULLIFIED' | 'PARTIALLY_NULLIFIED' | 'REVERSED'

export interface TransbankResponse {
  vci: string
  amount: number
  status: TransbankStatus
  buy_order: string
  session_id: string
  card_detail: {
    card_number: string
  }
  accounting_date: string
  transaction_date: string
  authorization_code: string
  payment_type_code: string
  response_code: number
  installments_amount: number
  installments_number: number
  balance: number | null
}

const TRANSBANK_COMMERCE_CODE = process.env.TRANSBANK_COMMERCE_CODE || '597055555532'
const TRANSBANK_API_KEY = process.env.TRANSBANK_API_KEY || '579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C'
const TRANSBANK_ENVIRONMENT = process.env.TRANSBANK_ENVIRONMENT || 'integration' // 'integration' | 'production'

/**
 * Crea una transaccion en WebPay Plus.
 * En modo stub, simula la respuesta de Transbank.
 */
export async function createTransaction(
  buyOrder: string,
  sessionId: string,
  amount: number,
  returnUrl: string
): Promise<{ url: string; token: string }> {
  // TODO: Replace with real Transbank SDK call:
  // const tx = new WebpayPlus.Transaction(new Options(TRANSBANK_COMMERCE_CODE, TRANSBANK_API_KEY, environment))
  // const response = await tx.create(buyOrder, sessionId, amount, returnUrl)
  // return { url: response.url, token: response.token }

  console.log(`[Transbank Stub] createTransaction: commerce=${TRANSBANK_COMMERCE_CODE}, env=${TRANSBANK_ENVIRONMENT}`)
  console.log(`[Transbank Stub] buyOrder=${buyOrder}, sessionId=${sessionId}, amount=${amount}`)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const stubToken = `TBK_TOKEN_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`

  return {
    url: `https://webpay3gint.transbank.cl/webpayserver/initTransaction?token_ws=${stubToken}`,
    token: stubToken,
  }
}

/**
 * Confirma una transaccion en WebPay Plus.
 * En modo stub, simula una respuesta exitosa.
 */
export async function commitTransaction(token: string): Promise<TransbankResponse> {
  // TODO: Replace with real Transbank SDK call:
  // const tx = new WebpayPlus.Transaction(new Options(TRANSBANK_COMMERCE_CODE, TRANSBANK_API_KEY, environment))
  // return await tx.commit(token)

  console.log(`[Transbank Stub] commitTransaction: token=${token}`)

  await new Promise((resolve) => setTimeout(resolve, 200))

  // Simular respuesta exitosa
  const response: TransbankResponse = {
    vci: 'TSY',
    amount: 0, // Se completara con el monto real
    status: 'AUTHORIZED',
    buy_order: `BO_${Date.now()}`,
    session_id: `SID_${Date.now()}`,
    card_detail: {
      card_number: 'XXXX-XXXX-XXXX-6623',
    },
    accounting_date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
    transaction_date: new Date().toISOString(),
    authorization_code: `AUTH_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    payment_type_code: 'VD',
    response_code: 0,
    installments_amount: 0,
    installments_number: 0,
    balance: null,
  }

  return response
}
