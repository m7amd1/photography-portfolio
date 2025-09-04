"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { fetchIsAdmin } from "@/lib/auth";
import { PhotoStore } from "@/lib/photo-store";

interface AuthContextType {
  loading: boolean;
  user: any | null;
  session: any | null;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  loading: true,
  user: null,
  session: null,
  isAdmin: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    PhotoStore.getInstance(supabase);
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;

    async function init() {
      try {
        // Add timeout to prevent infinite loading
        initTimeout = setTimeout(() => {
          if (isMounted) {
            console.warn(
              "Auth initialization timeout, setting loading to false"
            );
            setLoading(false);
          }
        }, 5000);

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) {
            setLoading(false);
            setSession(null);
            setUser(null);
            setIsAdmin(false);
          }
          return;
        }

        // console.log("Initial session data:", data);
        if (!isMounted) return;

        clearTimeout(initTimeout);
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);

        // Fetch admin status in background without blocking
        if (data.session?.user) {
          fetchIsAdmin()
            .then((adminStatus) => {
              if (isMounted) {
                setIsAdmin(adminStatus);
              }
            })
            .catch((error) => {
              console.error("Error fetching admin status:", error);
              if (isMounted) {
                setIsAdmin(false);
              }
            });
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error in AuthProvider init:", error);
        if (isMounted) {
          clearTimeout(initTimeout);
          setLoading(false);
          setIsAdmin(false);
        }
      }
    }

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;

      // console.log("Auth state change:", _event, newSession);
      setSession(newSession);
      setUser(newSession?.user ?? null);

      // Only set loading to false if we're not already loaded
      if (loading) {
        setLoading(false);
      }

      // Fetch admin status in background for authenticated users
      if (newSession?.user) {
        fetchIsAdmin()
          .then((adminStatus) => {
            if (isMounted) {
              setIsAdmin(adminStatus);
            }
          })
          .catch((error) => {
            console.error(
              "Error fetching admin status on auth state change:",
              error
            );
            if (isMounted) {
              setIsAdmin(false);
            }
          });
      } else {
        setIsAdmin(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [isHydrated, loading]);

  // Prevent hydration mismatch by not rendering until hydrated
  if (!isHydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ loading, user, session, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
