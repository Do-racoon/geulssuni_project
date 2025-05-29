"use client"

import { useState, useEffect } from "react"
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
  // Sign in with email and password (최적화됨)
  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    const supabaseClient = getSupabaseClient()
    const response = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    // 병렬로 사용자 역할 조회 (성공한 경우에만)
    if (response.data?.user && !response.error) {
      // 백그라운드에서 역할 조회 (await 없이)
      supabaseClient
        .from("users")
        .select("role")
        .eq("id", response.data.user.id)
        .single()
        .then(({ data: userData }) => {
          if (userData?.role && typeof window !== "undefined") {
            localStorage.setItem("userRole", userData.role)
          }
        })
        .catch((error) => console.error("Error fetching user role:", error))
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
      // 백그라운드에서 사용자 레코드 생성
      supabaseClient
        .from("users")
        .insert([
          {
            id: response.data.user.id,
            email: email,
            name: metadata?.name || "",
            nickname: metadata?.nickname || null,
            role: "user",
            class_name: metadata?.className || null,
            is_active: true,
            email_verified: false,
          },
        ])
        .catch((error) => console.error("Error creating user record:", error))
    }

    return response
  },

  // Sign out (최적화됨)
  signOut: async (): Promise<{ error: AuthError | null }> => {
    const supabaseClient = getSupabaseClient()

    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("userRole")
    }

    const result = await supabaseClient.auth.signOut()

    // Force page reload to clear any cached state
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }

    return result
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

  // Get user role (캐시 우선)
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

  // Check if user is admin (캐시 우선)
  isAdmin: async (): Promise<boolean> => {
    // 먼저 캐시된 역할 확인
    if (typeof window !== "undefined") {
      const cachedRole = localStorage.getItem("userRole")
      if (cachedRole) return cachedRole === "admin"
    }

    const supabaseClient = getSupabaseClient()
    const { data: user } = await supabaseClient.auth.getUser()

    if (!user.user) return false

    try {
      const { data: userData } = await supabaseClient.from("users").select("role").eq("id", user.user.id).single()

      if (userData?.role && typeof window !== "undefined") {
        localStorage.setItem("userRole", userData.role)
      }

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

// Get current user with full profile information
export const getCurrentUser = async () => {
  const supabaseClient = getSupabaseClient()

  try {
    // Get authenticated user
    const { data: authUser, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !authUser.user) {
      console.log("No authenticated user found")
      return null
    }

    console.log("Auth user found:", authUser.user.id, authUser.user.email)

    // First, try to find user by ID
    const { data: userProfilesById, error: profileByIdError } = await supabaseClient
      .from("users")
      .select("id, name, email, role, class_name")
      .eq("id", authUser.user.id)

    if (profileByIdError) {
      console.error("Error fetching user profile by ID:", profileByIdError)
    }

    // If found by ID, use it
    if (userProfilesById && userProfilesById.length > 0) {
      if (userProfilesById.length > 1) {
        console.warn(`Multiple user profiles found for user ID ${authUser.user.id}, using the first one`)
      }

      const userProfile = userProfilesById[0]
      return {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        class_level: userProfile.class_name,
      }
    }

    // If not found by ID, check if user exists with same email
    if (authUser.user.email) {
      const { data: userProfilesByEmail, error: profileByEmailError } = await supabaseClient
        .from("users")
        .select("id, name, email, role, class_name")
        .eq("email", authUser.user.email)

      if (profileByEmailError) {
        console.error("Error fetching user profile by email:", profileByEmailError)
      }

      // If user exists with same email but different ID, use the existing record
      if (userProfilesByEmail && userProfilesByEmail.length > 0) {
        console.log("Found user with same email but different ID, using existing record...")

        const existingUser = userProfilesByEmail[0]

        // Check if this user has any existing data that would prevent ID updates
        const { data: existingAssignments } = await supabaseClient
          .from("assignments")
          .select("id")
          .eq("instructor_id", existingUser.id)
          .limit(1)

        const { data: existingPosts } = await supabaseClient
          .from("board_posts")
          .select("id")
          .eq("author_id", existingUser.id)
          .limit(1)

        if ((existingAssignments && existingAssignments.length > 0) || (existingPosts && existingPosts.length > 0)) {
          console.log("User has existing assignments or posts, keeping original ID to preserve relationships")

          // Return the existing user record without modifying it
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            class_level: existingUser.class_name,
          }
        }

        // If no existing data, we can safely try to update the ID
        console.log("No existing data found, attempting to update user ID...")

        try {
          // First, update any assignments that reference this user
          await supabaseClient
            .from("assignments")
            .update({ instructor_id: authUser.user.id, author_id: authUser.user.id })
            .eq("instructor_id", existingUser.id)

          // Then update the user ID
          const { data: updatedUser, error: updateError } = await supabaseClient
            .from("users")
            .update({ id: authUser.user.id })
            .eq("email", authUser.user.email)
            .select("id, name, email, role, class_name")
            .single()

          if (updateError) {
            console.error("Error updating user ID:", updateError)
            // If update fails, return the existing user data
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role: existingUser.role,
              class_level: existingUser.class_name,
            }
          }

          return {
            id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            class_level: updatedUser.class_name,
          }
        } catch (updateError) {
          console.error("Failed to update user ID, using existing record:", updateError)

          // Return the existing user record as fallback
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            class_level: existingUser.class_name,
          }
        }
      }
    }

    // If no user found at all, create a new one
    console.log("No user profile found, creating new one...")

    const newUserData = {
      id: authUser.user.id,
      email: authUser.user.email || "",
      name: authUser.user.user_metadata?.name || authUser.user.email?.split("@")[0] || "사용자",
      role: "user",
      class_name: null,
      is_active: true,
      email_verified: authUser.user.email_confirmed_at ? true : false,
    }

    const { data: newUser, error: insertError } = await supabaseClient
      .from("users")
      .insert([newUserData])
      .select("id, name, email, role, class_name")
      .single()

    if (insertError) {
      console.error("Error creating user profile:", insertError)

      // If it's a duplicate key error, try to fetch the existing user again
      if (insertError.code === "23505" && authUser.user.email) {
        console.log("Duplicate key error, fetching existing user...")

        const { data: existingUser, error: fetchError } = await supabaseClient
          .from("users")
          .select("id, name, email, role, class_name")
          .eq("email", authUser.user.email)
          .single()

        if (!fetchError && existingUser) {
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            class_level: existingUser.class_name,
          }
        }
      }

      return null
    }

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      class_level: newUser.class_name,
    }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Add this at the end of the file
export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabaseClient = getSupabaseClient()
        const { data } = await supabaseClient.auth.getUser()
        setUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      } finally {
        setLoading(false)
      }
    }

    fetchUser()

    const supabaseClient = getSupabaseClient()
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  return { user, loading, error, ...auth }
}
