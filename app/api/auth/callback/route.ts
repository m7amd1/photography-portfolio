import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function POST(req: Request) {
  try {
    const { event, session } = await req.json()

    const res = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return undefined
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

    if (event === "SIGNED_IN" && session) {
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      })
    }

    if (event === "SIGNED_OUT") {
      await supabase.auth.signOut()
    }

    return res
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 400 })
  }
}
