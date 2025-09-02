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

  useEffect(() => {
    PhotoStore.getInstance(supabase);
    let isMounted = true;

    async function init() {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session data:", data);
        if (!isMounted) return;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setLoading(false);
        
        // Fetch admin status in background without blocking
        if (data.session?.user) {
          fetchIsAdmin()
            .then(adminStatus => {
              if (isMounted) {
                setIsAdmin(adminStatus);
              }
            })
            .catch(error => {
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
      
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setLoading(false);
      
      // Fetch admin status in background for authenticated users
      if (newSession?.user) {
        fetchIsAdmin()
          .then(adminStatus => {
            if (isMounted) {
              setIsAdmin(adminStatus);
            }
          })
          .catch(error => {
            console.error("Error fetching admin status on auth state change:", error);
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
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ loading, user, session, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
