import React, { createContext, useContext, useEffect, useState, useRef } from "react"
import { Session, User } from "@supabase/supabase-js"

import { supabase } from "../config/supabase"

export interface AuthContextType {
  // TODO: reconsider having session saved bcs we probably dont need it
  session: Session | null,
  user: User | null,
  isLoading: boolean,
  signOut: () => Promise<"error" | "success">,
  isAuthenticated: boolean,
  loadAuth: PromiseWithResolvers<AuthContextType>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setLoading] = useState(true)
  const [isAuthenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    // Get initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
        setAuthenticated(!!session?.user)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === "SIGNED_OUT") {
        setSession(null)
        setUser(null)
        setAuthenticated(false)
      } else {
        setSession(session)
        const newUser = session?.user ?? null
        setUser(newUser)
        setAuthenticated(!!session?.user)
      }        
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut: () => Promise<"success" | "error"> = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) return "error"
    else return "success"
  }

  const loadAuthRef = useRef(Promise.withResolvers<AuthContextType>())

  // TODO: is this really necessary??
  useEffect(() => {
    if (!isLoading) {
      loadAuthRef.current.resolve({
        session,
        user,
        isLoading,
        signOut,
        isAuthenticated,
        loadAuth: loadAuthRef.current
      })
    }
  }, [session, user, isLoading, isAuthenticated])

  const value = {
    session,
    user,
    isLoading,
    signOut,
    isAuthenticated,
    loadAuth: loadAuthRef.current
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}