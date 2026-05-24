import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Public routes
  const publicPaths = ['/', '/login', '/registro', '/recuperar', '/auth/callback']
  const isPublicPath =
    publicPaths.some((path) => request.nextUrl.pathname === path) ||
    request.nextUrl.pathname.startsWith('/auth/') ||
    request.nextUrl.pathname.startsWith('/preview/')

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublicPath) {
    // Get user role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile) {
      const pathname = request.nextUrl.pathname
      const role = profile.role

      // Route protection by role
      const roleRouteMap: Record<string, string> = {
        estudiante: '/dashboard',
        apoderado: '/panel',
        admin: '/admin',
      }

      const isCorrectRoute =
        (role === 'estudiante' && (pathname.startsWith('/dashboard') || pathname.startsWith('/cursos') || pathname.startsWith('/progreso') || pathname.startsWith('/logros') || pathname.startsWith('/repaso') || pathname.startsWith('/perfil'))) ||
        (role === 'apoderado' && (pathname.startsWith('/panel') || pathname.startsWith('/hijos') || pathname.startsWith('/pagos') || pathname.startsWith('/alertas'))) ||
        (role === 'admin' && pathname.startsWith('/admin'))

      if (!isCorrectRoute && !isPublicPath) {
        const url = request.nextUrl.clone()
        url.pathname = roleRouteMap[role] || '/login'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro')) {
    const { data: profile2 } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const roleRouteMap2: Record<string, string> = {
      estudiante: '/dashboard',
      apoderado: '/panel',
      admin: '/admin',
    }

    const url = request.nextUrl.clone()
    url.pathname = roleRouteMap2[profile2?.role || 'estudiante']
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
