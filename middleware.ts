import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const publicPaths = ["/auth", "/"] // Add other public paths as needed

  // Redirect authenticated users from /login to /dashboard
  if (session && req.nextUrl.pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // Protect /dashboard and /profile routes
  if (!session && (req.nextUrl.pathname.startsWith("/dashboard") || req.nextUrl.pathname.startsWith("/profile"))) {
    return NextResponse.redirect(new URL("/auth", req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any files in the public folder (e.g. images)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
