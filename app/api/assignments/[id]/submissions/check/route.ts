import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: assignmentId } = params
    const { studentName } = await request.json()

    if (!studentName) {
      return NextResponse.json({ error: "학생 이름이 필요합니다." }, { status: 400 })
    }

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 이름으로 기존 제출 확인
    const { data: existingSubmission, error } = await supabase
      .from("assignment_submissions")
      .select("id, student_name, submitted_at")
      .eq("assignment_id", assignmentId)
      .eq("student_name", studentName)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("제출 확인 오류:", error)
      return NextResponse.json({ error: "제출 확인 중 오류가 발생했습니다." }, { status: 500 })
    }

    if (existingSubmission) {
      return NextResponse.json({
        hasSubmitted: true,
        submittedAt: existingSubmission.submitted_at,
      })
    }

    return NextResponse.json({ hasSubmitted: false })
  } catch (error) {
    console.error("제출 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
