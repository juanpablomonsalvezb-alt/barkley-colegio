'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const registroSchema = z.object({
  fullName: z.string().min(3, 'Nombre completo requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  rut: z.string().optional(),
  phone: z.string().optional(),
})

export async function signupParent(formData: FormData) {
  const parsed = registroSchema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
    rut: formData.get('rut'),
    phone: formData.get('phone'),
  })

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const supabase = await createServerSupabaseClient()

  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: 'apoderado',
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: { general: ['Este email ya está registrado'] } }
    }
    return { error: { general: [error.message] } }
  }

  redirect('/panel')
}

export async function addChild(formData: FormData) {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: { general: ['No autenticado'] } }

  const childName = formData.get('childName') as string
  const childEmail = formData.get('childEmail') as string
  const childPassword = formData.get('childPassword') as string
  const gradeLevel = formData.get('gradeLevel') as string

  // Create child account using admin client (to avoid logging out parent)
  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()

  const { data: childData, error: signUpError } = await adminClient.auth.admin.createUser({
    email: childEmail,
    password: childPassword,
    email_confirm: true,
    user_metadata: {
      full_name: childName,
      role: 'estudiante',
    },
  })

  if (signUpError) {
    return { error: { general: [signUpError.message] } }
  }

  // Update child profile with parent link and grade
  if (childData.user) {
    await adminClient
      .from('profiles')
      .update({
        parent_id: user.id,
        grade_level: gradeLevel,
      })
      .eq('id', childData.user.id)
  }

  return { success: true }
}
