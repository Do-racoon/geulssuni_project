import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id: assignmentId } = params
    const { password } = await request.json()

    // 과제 정보 조회
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select("password")
      .eq("id", assignmentId)
      .single()

    if (error) {
      console.error("비밀번호 확인 오류:", error)
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호 확인
    if (assignment.password === password) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("비밀번호 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
