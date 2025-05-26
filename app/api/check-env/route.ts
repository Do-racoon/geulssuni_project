import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("Checking environment variables...")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log("Environment variables status:")
    console.log("SUPABASE_URL:", !!supabaseUrl)
    console.log("SUPABASE_ANON_KEY:", !!supabaseAnonKey)
    console.log("SUPABASE_SERVICE_ROLE_KEY:", !!serviceRoleKey)

    // 서비스 역할 키의 힌트 생성 (보안을 위해 일부만 표시)
    let serviceRoleKeyHint = ""
    if (serviceRoleKey) {
      if (serviceRoleKey.length > 10) {
        serviceRoleKeyHint = `${serviceRoleKey.substring(0, 5)}...${serviceRoleKey.substring(serviceRoleKey.length - 5)}`
      } else {
        serviceRoleKeyHint = "설정됨 (짧은 키)"
      }
    }

    // Anon 키의 힌트 생성
    let anonKeyHint = ""
    if (supabaseAnonKey) {
      if (supabaseAnonKey.length > 10) {
        anonKeyHint = `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
      } else {
        anonKeyHint = "설정됨 (짧은 키)"
      }
    }

    const response = {
      supabaseUrl: supabaseUrl || "",
      supabaseAnonKey: anonKeyHint,
      hasServiceRoleKey: !!serviceRoleKey,
      serviceRoleKeyHint: serviceRoleKeyHint,
      timestamp: new Date().toISOString(),
      allVariablesSet: !!(supabaseUrl && supabaseAnonKey && serviceRoleKey),
    }

    console.log("Environment check response:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error checking environment variables:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "환경변수 확인 중 오류가 발생했습니다.",
        details: {
          type: error?.constructor?.name || "Unknown",
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 },
    )
  }
}
