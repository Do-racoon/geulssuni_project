import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string; submissionId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id: assignmentId, submissionId } = params
    const { isChecked, checkedBy } = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 권한 확인 (관리자나 강사만 체크 가능)
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!dbUser || !["admin", "instructor", "teacher"].includes(dbUser.role)) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 })
    }

    // 제출물 체크 상태 업데이트
    const updateData: any = {
      is_checked: isChecked,
      updated_at: new Date().toISOString(),
    }

    if (isChecked) {
      updateData.checked_by = checkedBy
      updateData.checked_at = new Date().toISOString()
    } else {
      updateData.checked_by = null
      updateData.checked_at = null
    }

    const { data, error } = await supabase
      .from("assignment_submissions")
      .update(updateData)
      .eq("id", submissionId)
      .eq("assignment_id", assignmentId)
      .select()
      .single()

    if (error) {
      console.error("제출물 체크 상태 업데이트 오류:", error)
      return NextResponse.json({ error: "체크 상태를 업데이트할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("제출물 체크 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
