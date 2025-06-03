import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 사용자 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || userData.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    // 특정 과제 조회
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

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 사용자 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || userData.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const body = await request.json()

    // 과제 업데이트
    const { data: assignment, error } = await supabase
      .from("assignments")
      .update({
        title: body.title,
        description: body.description,
        content: body.content,
        class_level: body.class_level,
        due_date: body.due_date,
        max_submissions: body.max_submissions,
        instructor_id: body.instructor_id,
        password: body.password,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("과제 업데이트 오류:", error)
      return NextResponse.json({ error: "과제 업데이트에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json(assignment)
  } catch (error) {
    console.error("과제 업데이트 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 사용자 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || userData.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    // 과제 삭제
    const { error } = await supabase.from("assignments").delete().eq("id", params.id)

    if (error) {
      console.error("과제 삭제 오류:", error)
      return NextResponse.json({ error: "과제 삭제에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ message: "과제가 성공적으로 삭제되었습니다." })
  } catch (error) {
    console.error("과제 삭제 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
