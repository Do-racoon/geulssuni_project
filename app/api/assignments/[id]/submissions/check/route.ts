import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id
    const body = await request.json()

    // 현재 사용자가 이미 제출했는지 확인
    const { data: submission, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        student:users!student_id(name, email)
      `)
      .eq("assignment_id", assignmentId)
      .eq("student_id", body.studentId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("제출 확인 오류:", error)
      return NextResponse.json({ error: "제출 확인에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({
      hasSubmitted: !!submission,
      submission: submission || null,
    })
  } catch (error) {
    console.error("제출 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
