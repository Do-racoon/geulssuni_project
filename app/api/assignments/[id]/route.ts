import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 조회수 증가
    await supabase.rpc("increment_assignment_views", { assignment_id: id })

    // 과제 정보 조회
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(`
        id, title, content, description, class_level, due_date, 
        max_submissions, current_submissions, views, created_at, updated_at,
        author:users!author_id(id, name, email),
        instructor:users!instructor_id(id, name, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("과제 조회 오류:", error)
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("과제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params
    const body = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 권한 확인
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!dbUser || !["admin", "instructor", "teacher"].includes(dbUser.role)) {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 })
    }

    const updateData: any = {}

    // 허용된 필드만 업데이트
    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content
    if (body.description !== undefined) updateData.description = body.description
    if (body.class_level !== undefined) updateData.class_level = body.class_level
    if (body.due_date !== undefined) updateData.due_date = body.due_date
    if (body.max_submissions !== undefined) updateData.max_submissions = body.max_submissions
    if (body.password !== undefined) updateData.password = body.password || null
    if (body.review_status !== undefined) updateData.review_status = body.review_status

    updateData.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("assignments")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 수정 오류:", error)
      return NextResponse.json({ error: "과제를 수정할 수 없습니다." }, { status: 500 })
    }

    // 비밀번호 정보 처리
    const processedData = {
      ...data,
      has_password: !!data.password,
      password: undefined,
    }

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("과제 수정 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { id } = params

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 권한 확인
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!dbUser || !["admin", "instructor", "teacher"].includes(dbUser.role)) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 })
    }

    const { error } = await supabase.from("assignments").delete().eq("id", id)

    if (error) {
      console.error("과제 삭제 오류:", error)
      return NextResponse.json({ error: "과제를 삭제할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json({ message: "과제가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("과제 삭제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
