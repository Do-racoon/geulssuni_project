import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 현재 과제 상태 가져오기
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("review_status")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 검수 상태 토글
    const newStatus = assignment.review_status === "completed" ? "pending" : "completed"
    const updateData: any = {
      review_status: newStatus,
      updated_at: new Date().toISOString(),
    }

    // 검수 완료 시 검수자와 검수일 기록
    if (newStatus === "completed") {
      updateData.reviewed_by = user.id
      updateData.reviewed_at = new Date().toISOString()
    } else {
      updateData.reviewed_by = null
      updateData.reviewed_at = null
    }

    const { data, error } = await supabase
      .from("assignments")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 검수 상태 업데이트 오류:", error)
      return NextResponse.json({ error: "검수 상태를 업데이트할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("과제 검수 상태 변경 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
