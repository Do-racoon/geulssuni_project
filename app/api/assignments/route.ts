import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // assignments 테이블에서 모든 과제 가져오기 (작성자 정보 포함)
    const { data: assignments, error } = await supabase
      .from("assignments")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("과제 조회 오류:", error)
      return NextResponse.json({ error: "과제를 불러올 수 없습니다." }, { status: 500 })
    }

    // 작성자 정보 포맷팅
    const formattedAssignments = assignments?.map((assignment) => ({
      ...assignment,
      author: assignment.author
        ? {
            name: assignment.author.name || "Unknown",
            avatar: `/placeholder.svg?height=32&width=32&query=${assignment.author.name || "user"}`,
          }
        : null,
    }))

    return NextResponse.json(formattedAssignments || [])
  } catch (error) {
    console.error("과제 목록 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const { title, content, description, class_level, due_date, author_id } = body

    // 필수 필드 검증
    if (!title || !content || !class_level || !author_id) {
      return NextResponse.json({ error: "필수 필드가 누락되었습니다." }, { status: 400 })
    }

    // 새 과제 생성
    const { data: assignment, error } = await supabase
      .from("assignments")
      .insert({
        title,
        content,
        description: description || content.substring(0, 200),
        class_level,
        due_date,
        author_id,
        review_status: "pending",
        views: 0,
        submissions_count: 0,
        total_students: 0,
        is_completed: false,
      })
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 생성 오류:", error)
      return NextResponse.json({ error: "과제를 생성할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("과제 생성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
