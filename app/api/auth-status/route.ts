import { NextResponse } from "next/server"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({
      cookies: () => cookieStore,
    })

    // 현재 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Session error:", sessionError)
    }

    // 사용자 테이블에서 사용자 수 확인
    const { count, error: countError } = await supabase.from("users").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Count error:", countError)
    }

    return NextResponse.json({
      success: true,
      session: !!session,
      user: session?.user || null,
      userCount: count || 0,
      timestamp: new Date().toISOString(),
      message: session ? "사용자가 로그인되어 있습니다." : "로그인되지 않은 상태입니다.",
    })
  } catch (error) {
    console.error("Auth status check error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "인증 상태 확인 중 오류가 발생했습니다.",
      },
      { status: 500 },
    )
  }
}
