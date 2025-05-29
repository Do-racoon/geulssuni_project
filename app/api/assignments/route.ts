import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // 비밀번호 정보 처리
    const processedAssignments = assignments.map((assignment: any) => ({
      ...assignment,
      has_password: !!assignment.password,
      password: undefined, // 클라이언트에 비밀번호 자체는 전송하지 않음
    }))

    return NextResponse.json(processedAssignments || [])
  } catch (error) {
    console.error("과제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 사용자가 users 테이블에 존재하는지 확인
    const { data: dbUser, error: userError } = await supabase
      .from("users")
      .select("id, role")
      .eq("id", user.id)
      .single()

    let authorId = user.id

    if (userError || !dbUser) {
      // 사용자가 users 테이블에 없다면 이메일로 찾기
      const { data: userByEmail, error: emailError } = await supabase
        .from("users")
        .select("id, role")
        .eq("email", user.email)
        .single()

      if (emailError || !userByEmail) {
        return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
      }

      authorId = userByEmail.id
    }

    // 권한 확인 (관리자, 강사, 교사만 과제 생성 가능)
    const userRole =
      dbUser?.role || (await supabase.from("users").select("role").eq("id", authorId).single()).data?.role

    if (!["admin", "instructor", "teacher"].includes(userRole)) {
      return NextResponse.json({ error: "과제 생성 권한이 없습니다." }, { status: 403 })
    }

    const assignmentData = {
      title: body.title,
      description: body.description,
      content: body.content,
      class_level: body.class_level,
      due_date: body.due_date,
      max_submissions: body.max_submissions || 0,
      current_submissions: 0,
      author_id: authorId,
      instructor_id: authorId,
      review_status: "pending",
      views: 0,
      submissions_count: 0,
      total_students: body.total_students || body.max_submissions || 0,
      is_completed: false,
      attachment_url: body.attachment_url,
      password: body.password || null, // 비밀번호 필드 추가
    }

    const { data, error } = await supabase
      .from("assignments")
      .insert([assignmentData])
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 생성 오류:", error)
      return NextResponse.json({ error: "과제를 생성할 수 없습니다." }, { status: 500 })
    }

    // 비밀번호 정보 처리
    const processedData = {
      ...data,
      has_password: !!data.password,
      password: undefined,
    }

    return NextResponse.json(processedData, { status: 201 })
  } catch (error) {
    console.error("과제 생성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
