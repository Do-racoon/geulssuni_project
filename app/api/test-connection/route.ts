import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET() {
  try {
    console.log("Testing Supabase connection...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Environment variables check:")
    console.log("SUPABASE_URL exists:", !!supabaseUrl)
    console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey)

    if (!supabaseUrl || !supabaseAnonKey) {
      const missingVars = []
      if (!supabaseUrl) missingVars.push("NEXT_PUBLIC_SUPABASE_URL")
      if (!supabaseAnonKey) missingVars.push("NEXT_PUBLIC_SUPABASE_ANON_KEY")

      return NextResponse.json(
        {
          success: false,
          error: `Missing environment variables: ${missingVars.join(", ")}`,
          details: {
            supabaseUrl: !!supabaseUrl,
            supabaseAnonKey: !!supabaseAnonKey,
          },
        },
        { status: 400 },
      )
    }

    console.log("Creating Supabase client...")

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log("Testing database connection...")

    // 간단한 쿼리로 연결 테스트 - 더 간단한 방법 사용
    const { data, error, count } = await supabase.from("users").select("*", { count: "exact", head: true })

    console.log("Query result:", { data, error, count })

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: {
            code: error.code,
            hint: error.hint,
            details: error.details,
          },
        },
        { status: 500 },
      )
    }

    console.log("Connection test successful!")

    return NextResponse.json({
      success: true,
      message: "Supabase 연결 성공!",
      details: {
        userCount: count,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Unexpected error testing Supabase connection:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        details: {
          type: error?.constructor?.name || "Unknown",
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
