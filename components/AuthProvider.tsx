"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { fetchIsAdmin } from "@/lib/auth"

interface AuthContextType {
  loading: boolean
  user: any | null
  session: any | null
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({ loading: true, user: null, session: null, isAdmin: false })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any | null>(null)
  const [session, setSession] = useState<any | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      try {
        setIsAdmin(await fetchIsAdmin())
      } catch (error) {
        console.error("Error fetching admin status in AuthProvider init:", error)
        setIsAdmin(false) // Default to not admin on error
      } finally {
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      try {
        setIsAdmin(await fetchIsAdmin())
      } catch (error) {
        console.error("Error fetching admin status on auth state change:", error)
        setIsAdmin(false) // Default to not admin on error
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ loading, user, session, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
