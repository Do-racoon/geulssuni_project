import { supabase } from "@/lib/supabase/client"

export async function getSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data } = await supabase.from("users").select("*").eq("id", user.id).single()

    return data
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

export async function isAdmin() {
  try {
    const user = await getUserDetails()
    return user?.role === "admin"
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}
