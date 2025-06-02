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

    // 과제 정보 조회 (max_submissions 확인)
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("max_submissions")
      .eq("id", assignmentId)
      .single()

    if (assignmentError) {
      console.error("과제 정보 조회 오류:", assignmentError)
      return NextResponse.json({ error: "과제 정보를 불러올 수 없습니다." }, { status: 500 })
    }

    // 이름으로 기존 제출들 확인 (여러 개 가능)
    const { data: existingSubmissions, error } = await supabase
      .from("assignment_submissions")
      .select("id, student_name, submitted_at, file_name, file_url")
      .eq("assignment_id", assignmentId)
      .eq("student_name", studentName)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("제출 확인 오류:", error)
      return NextResponse.json({ error: "제출 확인 중 오류가 발생했습니다." }, { status: 500 })
    }

    const submissionCount = existingSubmissions?.length || 0
    const maxSubmissions = assignment.max_submissions || 1
    const canSubmitMore = submissionCount < maxSubmissions

    return NextResponse.json({
      hasSubmitted: submissionCount > 0,
      submissionCount,
      maxSubmissions,
      canSubmitMore,
      submissions: existingSubmissions || [],
    })
  } catch (error) {
    console.error("제출 확인 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
