import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id

    // 조회수 증가
    await supabase.rpc("increment_assignment_views", { assignment_id: assignmentId })

    // 과제 정보 가져오기
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("id", assignmentId)
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 과제 정보 가져오기
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("author_id")
      .eq("id", assignmentId)
      .single()

    if (assignmentError) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 사용자 권한 확인
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
    }

    // 관리자, 강사 또는 작성자만 삭제 가능
    const isAdmin = userData.role === "admin"
    const isInstructor = userData.role === "instructor" || userData.role === "teacher"
    const isAuthor = assignment.author_id === user.id

    if (!isAdmin && !isInstructor && !isAuthor) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 })
    }

    // 과제 삭제
    const { error: deleteError } = await supabase.from("assignments").delete().eq("id", assignmentId)

    if (deleteError) {
      return NextResponse.json({ error: "과제 삭제 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("과제 삭제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id
    const body = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 과제 정보 가져오기
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("author_id")
      .eq("id", assignmentId)
      .single()

    if (assignmentError) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 사용자 권한 확인
    const { data: userData, error: userError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userError) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
    }

    // 관리자, 강사 또는 작성자만 수정 가능
    const isAdmin = userData.role === "admin"
    const isInstructor = userData.role === "instructor" || userData.role === "teacher"
    const isAuthor = assignment.author_id === user.id

    if (!isAdmin && !isInstructor && !isAuthor) {
      return NextResponse.json({ error: "수정 권한이 없습니다." }, { status: 403 })
    }

    // 과제 수정
    const { data, error } = await supabase
      .from("assignments")
      .update({
        title: body.title,
        content: body.content,
        description: body.description,
        class_level: body.class_level,
        due_date: body.due_date,
        max_submissions: body.max_submissions,
        attachment_url: body.attachment_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", assignmentId)
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      return NextResponse.json({ error: "과제 수정 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("과제 수정 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
