import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, name, role } = await request.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Missing Supabase environment variables" }, { status: 500 })
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    // First, check if user already exists
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (getUserError && getUserError.code !== "PGRST116") {
      throw getUserError
    }

    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      })
    }

    // Hash the password for storage in our database
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })

    if (error) throw error

    // Create user in our users table with hashed password
    const { error: insertError } = await supabaseAdmin.from("users").insert([
      {
        id: data.user.id,
        email,
        name,
        role,
        password_hash: hashedPassword,
        is_active: true,
        email_verified: true,
      },
    ])

    if (insertError) throw insertError

    return NextResponse.json({
      success: true,
      message: "User created successfully with confirmed email",
      userId: data.user.id,
      credentials: {
        email,
        password, // 응답에 평문 비밀번호 포함 (개발용)
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create user",
      },
      { status: 500 },
    )
  }
}
