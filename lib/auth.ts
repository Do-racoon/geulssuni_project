"use client"

import { getSupabaseClient } from "./supabase/client"
import type { Session, User, AuthError } from "@supabase/supabase-js"

export type AuthResponse = {
  data: {
    user: User | null
    session: Session | null
  } | null
  error: AuthError | null
}

export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const supabaseClient = getSupabaseClient()
    const response = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    // Store user role in localStorage for client-side role checks
    if (response.data?.user) {
      try {
        const { data: userData } = await supabaseClient
          .from("users")
          .select("role")
          .eq("id", response.data.user.id)
          .single()

        if (userData?.role && typeof window !== "undefined") {
          localStorage.setItem("userRole", userData.role)
        }
      } catch (error) {
        console.error("Error fetching user role:", error)
      }
    }

    return response
  },

  // Sign up with email and password
  signUp: async (email: string, password: string, metadata?: { [key: string]: any }): Promise<AuthResponse> => {
    const supabaseClient = getSupabaseClient()

    // First, create the auth user
    const response = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    })

    // If successful, also create a record in our users table
    if (response.data?.user) {
      try {
        await supabaseClient.from("users").insert([
          {
            id: response.data.user.id,
            email: email,
            name: metadata?.name || "",
            nickname: metadata?.nickname || null,
            role: "user", // Default role is user, admin can change later
            class_name: metadata?.className || null,
            is_active: true,
            email_verified: false,
          },
        ])
      } catch (error) {
        console.error("Error creating user record:", error)
      }
    }

    return response
  },

  // Sign out
  signOut: async (): Promise<{ error: AuthError | null }> => {
    const supabaseClient = getSupabaseClient()
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole")
    }
    return await supabaseClient.auth.signOut()
  },

  // Get current session
  getSession: async (): Promise<Session | null> => {
    const supabaseClient = getSupabaseClient()
    const { data } = await supabaseClient.auth.getSession()
    return data.session
  },

  // Get current user
  getUser: async (): Promise<User | null> => {
    const supabaseClient = getSupabaseClient()
    const { data } = await supabaseClient.auth.getUser()
    return data.user
  },

  // Get user role
  getUserRole: async (): Promise<string | null> => {
    // First check localStorage for cached role
    if (typeof window !== "undefined") {
      const cachedRole = localStorage.getItem("userRole")
      if (cachedRole) return cachedRole
    }

    // If not in cache, fetch from database
    const supabaseClient = getSupabaseClient()
    const { data: user } = await supabaseClient.auth.getUser()

    if (!user.user) return null

    try {
      const { data: userData } = await supabaseClient.from("users").select("role").eq("id", user.user.id).single()

      if (userData?.role && typeof window !== "undefined") {
        localStorage.setItem("userRole", userData.role)
        return userData.role
      }
    } catch (error) {
      console.error("Error fetching user role:", error)
    }

    return null
  },

  // Check if user is admin
  isAdmin: async (): Promise<boolean> => {
    const supabaseClient = getSupabaseClient()
    const { data: user } = await supabaseClient.auth.getUser()

    if (!user.user) return false

    try {
      // DB에서 직접 역할 확인
      const { data: userData } = await supabaseClient.from("users").select("role").eq("id", user.user.id).single()

      return userData?.role === "admin"
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  },

  // Update user data
  updateUser: async (userData: { [key: string]: any }): Promise<AuthResponse> => {
    const supabaseClient = getSupabaseClient()
    return await supabaseClient.auth.updateUser({
      data: userData,
    })
  },

  // Reset password
  resetPassword: async (email: string): Promise<{ error: AuthError | null }> => {
    const supabaseClient = getSupabaseClient()
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  },
}
