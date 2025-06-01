"use client"

import { createContext, useContext, type ReactNode, useState, useEffect } from "react"
import { createSupabaseClient } from "./client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Context 생성
const SupabaseContext = createContext<SupabaseClient<Database> | undefined>(undefined)

// Provider 컴포넌트
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createSupabaseClient())

  // 세션 변경 감지
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔄 Auth state changed:", event, session?.user?.email)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

// 훅
export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider")
  }
  return context
}

// 세션 관련 훅들
export function useSupabaseAuth() {
  const supabase = useSupabase()

  const getSession = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      return { session, error }
    } catch (error) {
      console.error("Session error:", error)
      return { session: null, error }
    }
  }

  const getUser = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      return { user, error }
    } catch (error) {
      console.error("User error:", error)
      return { user: null, error }
    }
  }

  return { getSession, getUser, supabase }
}
