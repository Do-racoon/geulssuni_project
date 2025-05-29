import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // assignments 테이블에서 모든 과제 가져오기
    const { data: assignments, error } = await supabase
      .from("assignments")
      .select(`
        *,
        instructor:users!instructor_id(name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("과제 조회 오류:", error)
      return NextResponse.json({ error: "과제를 불러올 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error("과제 목록 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
