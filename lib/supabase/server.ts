import { supabase } from "./client"

export { supabase }

export async function getServerSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

export async function getServerUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}
