import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id: assignmentId } = params
    const { studentId } = await request.json()

    // 제출 정보 조회
    const { data: submission, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116: 결과가 없음
      console.error("제출 확인 오류:", error)
      return NextResponse.json({ error: "제출 정보를 확인할 수 없습니다." }, { status: 500 })
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
