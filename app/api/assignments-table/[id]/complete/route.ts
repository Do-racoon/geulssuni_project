import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 과제 상태 가져오기
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("is_completed")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 완료 상태 토글
    const { data, error } = await supabase
      .from("assignments")
      .update({
        is_completed: !assignment.is_completed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("과제 상태 업데이트 오류:", error)
      return NextResponse.json({ error: "과제 상태를 업데이트할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("과제 완료 상태 변경 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
