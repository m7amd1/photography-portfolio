import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()
  
  // Add cache control headers to prevent caching issues
  res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  res.headers.set('Pragma', 'no-cache')
  res.headers.set('Expires', '0')
  
  // Add headers to prevent hydration issues
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Public paths (extend as needed)
    const publicPaths = ["/auth", "/", "/api/auth/callback"]

    // Allow public paths
    if (publicPaths.some((p) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p))) {
      return res
    }

    // If user is signed in and the current path is /auth redirect the user to /dashboard
    if (session && req.nextUrl.pathname === '/auth') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Protect /dashboard and /profile routes
    if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/profile"))) {
      return NextResponse.redirect(new URL("/auth", req.url))
    }
  } catch (error) {
    console.error('Middleware auth error:', error)
    // Don't block the request if auth fails
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
