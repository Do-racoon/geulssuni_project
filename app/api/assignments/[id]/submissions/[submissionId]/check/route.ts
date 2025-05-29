import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string; submissionId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { submissionId } = params
    const body = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 권한 확인 (관리자 또는 강사만 체크 가능)
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!dbUser || !["admin", "instructor", "teacher"].includes(dbUser.role)) {
      return NextResponse.json({ error: "체크 권한이 없습니다." }, { status: 403 })
    }

    // 제출 체크 업데이트
    const { data, error } = await supabase
      .from("assignment_submissions")
      .update({
        is_checked: true,
        checked_by: user.id,
        checked_at: new Date().toISOString(),
        feedback: body.feedback || null,
      })
      .eq("id", submissionId)
      .select(`
        *,
        student:users!student_id(name, email),
        checked_by_user:users!checked_by(name, email)
      `)
      .single()

    if (error) {
      console.error("제출 체크 오류:", error)
      return NextResponse.json({ error: "체크 처리에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("제출 체크 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
