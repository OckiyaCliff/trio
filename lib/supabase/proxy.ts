import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

import { ROLE_DASHBOARD_MAP, type UserRole } from '@/lib/types'

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Protected dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }

    // Get user's role from profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const userRole = profile.role as UserRole
      const allowedDashboard = ROLE_DASHBOARD_MAP[userRole]

      // Check if user is accessing their allowed dashboard
      const isAccessingOwnDashboard = pathname.startsWith(allowedDashboard)

      if (!isAccessingOwnDashboard) {
        // Redirect to their correct dashboard
        const url = request.nextUrl.clone()
        url.pathname = allowedDashboard
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith('/auth') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role) {
      const url = request.nextUrl.clone()
      url.pathname = ROLE_DASHBOARD_MAP[profile.role as UserRole]
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
