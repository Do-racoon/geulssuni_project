import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { code, email, newPassword } = await request.json()

    if (!code || !email || !newPassword) {
      return NextResponse.json({ error: "모든 필드를 입력해주세요." }, { status: 400 })
    }

    // 인증번호 확인
    const { data: resetCode, error: codeError } = await supabase
      .from("password_reset_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .single()

    if (codeError || !resetCode) {
      return NextResponse.json({ error: "유효하지 않은 인증번호입니다." }, { status: 400 })
    }

    // 만료 시간 확인
    if (new Date() > new Date(resetCode.expires_at)) {
      return NextResponse.json({ error: "인증번호가 만료되었습니다." }, { status: 400 })
    }

    // 사용자 찾기
    const { data: user, error: userError } = await supabase.from("users").select("id").eq("email", email).single()

    if (userError || !user) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    // Supabase Auth에서 비밀번호 변경 (원래대로 단순하게)
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password: newPassword })

    if (updateError) {
      throw updateError
    }

    // 인증번호 사용 처리
    await supabase.from("password_reset_codes").update({ used: true }).eq("id", resetCode.id)

    return NextResponse.json({
      success: true,
      message: "비밀번호가 성공적으로 변경되었습니다.",
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "비밀번호 변경에 실패했습니다." }, { status: 500 })
  }
}
