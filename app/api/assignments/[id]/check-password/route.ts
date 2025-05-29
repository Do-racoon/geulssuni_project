import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json({ error: "비밀번호가 필요합니다." }, { status: 400 })
    }

    // 과제 정보 조회
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select("password")
      .eq("id", params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호 확인
    if (assignment.password !== password) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("비밀번호 확인 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
