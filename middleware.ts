import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path?: string; domain?: string; secure?: boolean; httpOnly?: boolean; sameSite?: "lax" | "strict" | "none"; maxAge?: number }) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: { path?: string; domain?: string }) {
          res.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public paths (extend as needed)
  const publicPaths = ["/auth", "/", "/api/auth/callback"]

  // Allow public paths
  if (publicPaths.some((p) => req.nextUrl.pathname === p || req.nextUrl.pathname.startsWith(p))) {
    return res
  }

  // Redirect authenticated users from /auth to /dashboard
  if (session && req.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect /dashboard and /profile routes (basic example)
  if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/profile"))) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  return res
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
