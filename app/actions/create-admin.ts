"use server"

import { supabaseAdmin } from "@/lib/supabase-admin"

export async function createAdminUser() {
  try {
    // Check if admin exists in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserByEmail("admin@site.com")

    if (authError) {
      // Admin doesn't exist, create it
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: "admin@site.com",
        password: "admin1234",
        email_confirm: true,
        user_metadata: {
          name: "System Administrator",
          role: "admin",
        },
      })

      if (error) throw error

      // Check if user exists in our users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("email", "admin@site.com")
        .single()

      if (userError && userError.code !== "PGRST116") {
        throw userError
      }

      if (!userData) {
        // Create user in our table
        const { error: insertError } = await supabaseAdmin.from("users").insert([
          {
            id: data.user.id,
            email: "admin@site.com",
            name: "System Administrator",
            role: "admin",
            is_active: true,
            email_verified: true,
          },
        ])

        if (insertError) throw insertError
      }

      return { success: true, message: "Admin user created successfully" }
    }

    // Admin exists, update to ensure email is confirmed
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUser.user.id, {
      email_confirm: true,
    })

    if (updateError) throw updateError

    return { success: true, message: "Admin user already exists and has been updated" }
  } catch (error) {
    console.error("Error creating admin user:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create admin user",
    }
  }
}
