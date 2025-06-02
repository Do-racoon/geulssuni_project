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

    // 개발 환경에서는 이메일 확인 건너뛰기, 프로덕션에서는 이메일 인증 사용
    const isDevelopment = process.env.NODE_ENV === "development"

    try {
      // Create user with Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: isDevelopment, // 개발환경에서만 자동 확인
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
          email_verified: isDevelopment, // 개발환경에서만 자동 확인
        },
      ])

      if (insertError) throw insertError

      return NextResponse.json({
        success: true,
        message: isDevelopment
          ? "User created successfully (development mode - email verification skipped)"
          : "User created successfully. Please check your email for verification.",
        userId: data.user.id,
        requiresEmailVerification: !isDevelopment,
        credentials: isDevelopment
          ? {
              email,
              password, // 개발환경에서만 비밀번호 반환
            }
          : undefined,
      })
    } catch (authError: any) {
      // 이메일 발송 오류인 경우 개발 모드로 폴백
      if (authError.message?.includes("email") || authError.message?.includes("confirmation")) {
        console.log("Email sending failed, falling back to development mode")

        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // 강제로 확인된 상태로 생성
          user_metadata: {
            name,
            role,
          },
        })

        if (error) throw error

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
          message: "User created successfully (email verification temporarily disabled)",
          userId: data.user.id,
          credentials: {
            email,
            password,
          },
        })
      }

      throw authError
    }
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
