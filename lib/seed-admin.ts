"use server"

import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"
import { config } from "./config"

export async function seedDefaultAdmin() {
  if (!config.supabase.serviceRoleKey) {
    console.error("Service role key is required for seeding admin")
    return { success: false, error: "Service role key is missing" }
  }

  const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey)

  try {
    // Create admin user in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@site.com",
      password: "admin1234",
      email_confirm: true,
    })

    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`)
    }

    // Hash the password for storage in our custom users table
    const hashedPassword = await bcrypt.hash("admin1234", 10)

    // Create or update the user in our custom users table
    const { error: userError } = await supabase.from("users").upsert({
      id: authUser.user.id,
      email: "admin@site.com",
      password_hash: hashedPassword,
      name: "System Administrator",
      role: "admin",
      is_active: true,
      email_verified: true,
    })

    if (userError) {
      throw new Error(`Error creating user record: ${userError.message}`)
    }

    return { success: true }
  } catch (error) {
    console.error("Error seeding admin:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
