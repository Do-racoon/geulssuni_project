import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    const { password } = await request.json()

    // 과제 정보 조회 (비밀번호 포함)
    const { data: assignment, error } = await supabase.from("assignments").select("password").eq("id", id).single()

    if (error) {
      console.error("과제 조회 오류:", error)
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호가 설정되지 않은 경우
    if (!assignment.password) {
      return NextResponse.json({ success: true })
    }

    // 비밀번호 확인
    if (assignment.password === password) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("비밀번호 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
