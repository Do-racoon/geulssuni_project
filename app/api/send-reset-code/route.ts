import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()

    if (!email || !name) {
      return NextResponse.json({ error: "이메일과 이름을 모두 입력해주세요." }, { status: 400 })
    }

    // 사용자 존재 확인
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email")
      .eq("email", email)
      .eq("name", name)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: "일치하는 사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    // 6자리 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 만료 시간 설정 (30분)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // 기존 인증번호 삭제
    await supabase.from("password_reset_codes").delete().eq("email", email)

    // 새 인증번호 저장
    const { error: insertError } = await supabase.from("password_reset_codes").insert({
      email,
      name,
      code,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error("Insert error:", insertError)
      return NextResponse.json({ error: "인증번호 저장에 실패했습니다." }, { status: 500 })
    }

    // 콘솔에 인증번호 출력
    console.log(`=== 비밀번호 재설정 인증번호 ===`)
    console.log(`이메일: ${email}`)
    console.log(`이름: ${name}`)
    console.log(`인증번호: ${code}`)
    console.log(`만료시간: ${expiresAt}`)
    console.log(`================================`)

    return NextResponse.json({
      success: true,
      message: "인증번호가 생성되었습니다.",
      code: code,
      expiresAt: expiresAt,
    })
  } catch (error) {
    console.error("Reset code send error:", error)
    return NextResponse.json(
      {
        error: "인증번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    )
  }
}
