'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/database.types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || !allowedRoles.includes(profile.role as UserRole)) {
        const routes: Record<string, string> = {
          estudiante: '/dashboard',
          apoderado: '/panel',
          admin: '/admin',
        }
        router.push(routes[profile?.role || 'estudiante'])
        return
      }

      setAuthorized(true)
      setLoading(false)
    }

    checkRole()
  }, [allowedRoles, router])

  if (loading) return fallback || null
  if (!authorized) return null

  return <>{children}</>
}
