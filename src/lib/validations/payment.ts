import { z } from 'zod'

export const createPaymentSchema = z.object({
  payerId: z.string().uuid('ID de pagador invalido'),
  studentId: z.string().uuid('ID de estudiante invalido'),
  planId: z.string().uuid('ID de plan invalido'),
  paymentMethod: z.enum(['transbank', 'khipu', 'transferencia_manual'], {
    error: 'Metodo de pago invalido',
  }),
})

export const verifyPaymentSchema = z.object({
  paymentId: z.string().uuid('ID de pago invalido'),
})

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>
