import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: "Missing Supabase admin environment variables" },
        { status: 500 },
      )
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // Try to get the admin user first by querying the users table
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", "admin@site.com")
      .single()

    if (getUserError && getUserError.code !== "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      throw getUserError
    }

    // Check if user exists in auth by trying to sign in
    // This is a workaround since we can't directly query auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: "admin@site.com",
      password: "admin1234",
    })

    // If sign in works, the user exists in auth
    const userExistsInAuth = !authError || authError.message !== "Invalid login credentials"

    if (userExistsInAuth && authData?.user) {
      // User exists in auth, update our users table if needed
      if (!existingUser) {
        const { error: insertError } = await supabaseAdmin.from("users").insert([
          {
            id: authData.user.id,
            email: "admin@site.com",
            name: "System Administrator",
            role: "admin",
            is_active: true,
            email_verified: true,
          },
        ])

        if (insertError) throw insertError
      }

      return NextResponse.json({
        success: true,
        message: "Admin user already exists and has been verified",
        userId: authData.user.id,
      })
    }

    // Admin doesn't exist or password is wrong, create it
    const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.signUp({
      email: "admin@site.com",
      password: "admin1234",
      options: {
        data: {
          name: "System Administrator",
          role: "admin",
        },
      },
    })

    if (signUpError) {
      // If error is "User already registered", try to update the password
      if (signUpError.message.includes("already registered")) {
        // We can't reset password without auth, so inform the user
        return NextResponse.json({
          success: false,
          message:
            "Admin user exists but password may be different. Try a different password or reset it through Supabase dashboard.",
        })
      }
      throw signUpError
    }

    if (!signUpData?.user) {
      throw new Error("Failed to create admin user")
    }

    // Ensure the user exists in our public.users table
    const { error: upsertError } = await supabaseAdmin.from("users").upsert(
      {
        id: signUpData.user.id,
        email: "admin@site.com",
        name: "System Administrator",
        role: "admin",
        is_active: true,
        email_verified: true,
      },
      { onConflict: "email" },
    )

    if (upsertError) throw upsertError

    return NextResponse.json({
      success: true,
      message:
        "Admin user created successfully. IMPORTANT: You need to confirm the email before logging in. Check your email or disable email confirmation in Supabase dashboard.",
      userId: signUpData.user.id,
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create admin user",
      },
      { status: 500 },
    )
  }
}
