import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (!email) {
      return NextResponse.json({ error: "이메일이 필요합니다." }, { status: 400 })
    }

    // 최신 인증번호 조회
    const { data: resetCode, error } = await supabase
      .from("password_reset_codes")
      .select("code, expires_at, used")
      .eq("email", email)
      .eq("used", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error || !resetCode) {
      return NextResponse.json({ error: "인증번호를 찾을 수 없습니다." }, { status: 404 })
    }

    // 만료 확인
    if (new Date() > new Date(resetCode.expires_at)) {
      return NextResponse.json({ error: "인증번호가 만료되었습니다." }, { status: 400 })
    }

    return NextResponse.json({
      code: resetCode.code,
      expires_at: resetCode.expires_at,
    })
  } catch (error) {
    console.error("Get reset code error:", error)
    return NextResponse.json({ error: "인증번호 조회에 실패했습니다." }, { status: 500 })
  }
}
