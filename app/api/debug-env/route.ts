import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== 서버 환경변수 디버깅 시작 ===")

    // 모든 환경변수 키 확인
    const allEnvKeys = Object.keys(process.env)
    const publicEnvKeys = allEnvKeys.filter((key) => key.startsWith("NEXT_PUBLIC_"))

    console.log("전체 환경변수 개수:", allEnvKeys.length)
    console.log("NEXT_PUBLIC_ 환경변수 개수:", publicEnvKeys.length)
    console.log("NEXT_PUBLIC_ 환경변수들:", publicEnvKeys)

    // 특정 환경변수들 확인
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const nodeEnv = process.env.NODE_ENV

    console.log("NEXT_PUBLIC_SUPABASE_URL 존재:", !!supabaseUrl)
    console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY 존재:", !!supabaseAnonKey)
    console.log("SUPABASE_SERVICE_ROLE_KEY 존재:", !!serviceRoleKey)
    console.log("NODE_ENV:", nodeEnv)

    if (supabaseUrl) {
      console.log("SUPABASE_URL 값:", supabaseUrl)
    }

    // 안전한 힌트 생성
    const anonKeyHint = supabaseAnonKey
      ? `${supabaseAnonKey.substring(0, 5)}...${supabaseAnonKey.substring(supabaseAnonKey.length - 5)}`
      : ""

    const serviceKeyHint = serviceRoleKey
      ? `${serviceRoleKey.substring(0, 5)}...${serviceRoleKey.substring(serviceRoleKey.length - 5)}`
      : ""

    const response = {
      supabaseUrl: supabaseUrl || "",
      hasAnonKey: !!supabaseAnonKey,
      anonKeyHint,
      hasServiceKey: !!serviceRoleKey,
      serviceKeyHint,
      nodeEnv: nodeEnv || "",
      totalEnvCount: allEnvKeys.length,
      publicEnvCount: publicEnvKeys.length,
      publicEnvKeys,
      timestamp: new Date().toISOString(),
      // 디버깅을 위한 추가 정보
      vercelEnv: process.env.VERCEL_ENV || "not-vercel",
      vercelUrl: process.env.VERCEL_URL || "not-set",
    }

    console.log("응답 데이터:", response)
    console.log("=== 서버 환경변수 디버깅 완료 ===")

    return NextResponse.json(response)
  } catch (error) {
    console.error("환경변수 디버깅 오류:", error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "환경변수 확인 중 오류가 발생했습니다.",
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
