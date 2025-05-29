import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    const { password } = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 관리자나 강사는 비밀번호 없이 접근 가능
    if (user) {
      const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()
      if (dbUser && ["admin", "instructor", "teacher"].includes(dbUser.role)) {
        return NextResponse.json({ success: true })
      }
    }

    // 과제 정보 조회
    const { data: assignment, error } = await supabase.from("assignments").select("password").eq("id", id).single()

    if (error || !assignment) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호 확인
    if (assignment.password !== password) {
      return NextResponse.json({ error: "비밀번호가 일치하지 않습니다." }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("비밀번호 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
