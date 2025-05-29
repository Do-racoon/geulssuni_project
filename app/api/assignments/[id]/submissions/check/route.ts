import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id
    const body = await request.json()
    const { studentId, studentName } = body

    // studentId가 없거나 "anonymous"인 경우
    if (!studentId || studentId === "anonymous") {
      // 학생 이름으로 검색 (로그인하지 않은 사용자의 경우)
      if (studentName) {
        const { data: submissions, error } = await supabase
          .from("assignment_submissions")
          .select("*")
          .eq("assignment_id", assignmentId)
          .eq("student_name", studentName)
          .order("submitted_at", { ascending: false })
          .limit(1)

        if (error) {
          console.error("제출 확인 오류:", error)
          return NextResponse.json({ hasSubmitted: false })
        }

        if (submissions && submissions.length > 0) {
          return NextResponse.json({
            hasSubmitted: true,
            submission: submissions[0],
          })
        }
      }

      return NextResponse.json({ hasSubmitted: false })
    }

    // 로그인한 사용자의 경우 student_id로 검색
    const { data: submissions, error } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("assignment_id", assignmentId)
      .eq("student_id", studentId)
      .order("submitted_at", { ascending: false })
      .limit(1)

    if (error) {
      console.error("제출 확인 오류:", error)
      return NextResponse.json({ hasSubmitted: false })
    }

    if (submissions && submissions.length > 0) {
      return NextResponse.json({
        hasSubmitted: true,
        submission: submissions[0],
      })
    }

    return NextResponse.json({ hasSubmitted: false })
  } catch (error) {
    console.error("제출 확인 API 오류:", error)
    return NextResponse.json({ hasSubmitted: false })
  }
}
