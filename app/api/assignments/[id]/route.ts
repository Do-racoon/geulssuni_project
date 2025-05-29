import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id

    // 조회수 증가
    await supabase.rpc("increment_assignment_views", { assignment_id: assignmentId })

    // 과제 정보 조회
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(`
        *,
        author:users!author_id(name, email),
        instructor:users!instructor_id(name, email)
      `)
      .eq("id", assignmentId)
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("과제 조회 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
