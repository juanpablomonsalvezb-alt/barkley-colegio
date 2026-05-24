import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rut: z.string().optional(),
  phone: z.string().optional(),
})

export const addChildSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(6, 'La contrasena debe tener al menos 6 caracteres'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  grade_level: z.enum([
    '5_basico',
    '6_basico',
    '7_basico',
    '8_basico',
    '1_medio',
    '2_medio',
    '3_medio',
    '4_medio',
  ]),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type AddChildInput = z.infer<typeof addChildSchema>
