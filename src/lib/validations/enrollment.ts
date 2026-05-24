import { z } from 'zod'

export const createEnrollmentSchema = z.object({
  studentId: z.string().uuid('ID de estudiante invalido'),
  planId: z.string().uuid('ID de plan invalido'),
  gradeLevel: z.enum([
    '5_basico',
    '6_basico',
    '7_basico',
    '8_basico',
    '1_medio',
    '2_medio',
    '3_medio',
    '4_medio',
  ]),
  academicYear: z.number().int().min(2024).max(2030),
})

export const updateEnrollmentSchema = z.object({
  status: z.enum(['pendiente', 'activa', 'suspendida', 'cancelada', 'completada']),
  notes: z.string().optional(),
})

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>
