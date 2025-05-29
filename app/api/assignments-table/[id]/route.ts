import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 특정 과제 정보 가져오기
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(`
        *,
        instructor:users!instructor_id(name, email)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.error("과제 조회 오류:", error)
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("과제 상세 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
