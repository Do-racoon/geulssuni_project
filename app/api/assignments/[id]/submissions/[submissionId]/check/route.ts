import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { getCurrentUser } from "@/lib/auth"

export async function PATCH(request: Request, { params }: { params: { id: string; submissionId: string } }) {
  try {
    const { submissionId } = params

    // 현재 사용자 정보 가져오기
    const currentUser = await getCurrentUser()
    if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "instructor")) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 현재 제출 상태 확인
    const { data: currentSubmission, error: fetchError } = await supabase
      .from("assignment_submissions")
      .select("is_checked")
      .eq("id", submissionId)
      .single()

    if (fetchError) {
      console.error("제출 정보 조회 오류:", fetchError)
      return NextResponse.json({ error: "제출 정보를 찾을 수 없습니다." }, { status: 404 })
    }

    // 체크 상태 토글
    const newCheckedStatus = !currentSubmission.is_checked

    const { data: updatedSubmission, error: updateError } = await supabase
      .from("assignment_submissions")
      .update({
        is_checked: newCheckedStatus,
        checked_at: newCheckedStatus ? new Date().toISOString() : null,
        checked_by: newCheckedStatus ? currentUser.id : null, // 실제 사용자 ID 사용
      })
      .eq("id", submissionId)
      .select(`
        id,
        student_name,
        file_name,
        file_url,
        submitted_at,
        is_checked,
        checked_by,
        checked_at,
        comment,
        feedback
      `)
      .single()

    if (updateError) {
      console.error("제출 상태 업데이트 오류:", updateError)
      return NextResponse.json({ error: "제출 상태 업데이트에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json(updatedSubmission)
  } catch (error) {
    console.error("제출 체크 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
