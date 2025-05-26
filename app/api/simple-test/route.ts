import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("=== 간단한 Supabase 테스트 시작 ===")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        error: "환경변수가 설정되지 않았습니다.",
        details: {
          hasUrl: !!supabaseUrl,
          hasKey: !!supabaseAnonKey,
        },
      })
    }

    // 동적 import로 Supabase 클라이언트 생성
    const { createClient } = await import("@supabase/supabase-js")
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log("Supabase 클라이언트 생성 완료")

    // 매우 간단한 테스트 - auth 상태만 확인
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    console.log("Auth 세션 확인 완료:", { session: !!session, error })

    return NextResponse.json({
      success: true,
      message: "Supabase 연결 성공",
      details: {
        hasSession: !!session,
        authError: error?.message || null,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Supabase 테스트 오류:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
