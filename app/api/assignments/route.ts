import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

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

    // 권한 확인
    const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!dbUser || !["admin", "instructor", "teacher"].includes(dbUser.role)) {
      return NextResponse.json({ error: "생성 권한이 없습니다." }, { status: 403 })
    }

    // 필수 필드 확인
    if (!body.title || !body.content || !body.class_level) {
      return NextResponse.json({ error: "제목, 내용, 클래스 레벨은 필수입니다." }, { status: 400 })
    }

    // 해당 클래스 레벨의 학생 수 조회
    const { data: studentsCount, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact" })
      .eq("role", "user")
      .eq("class_level", body.class_level)

    if (countError) {
      console.error("학생 수 조회 오류:", countError)
    }

    const totalStudents = studentsCount?.length || 0

    // 과제 생성
    const { data, error } = await supabase
      .from("assignments")
      .insert([
        {
          title: body.title,
          content: body.content,
          description: body.description || "",
          class_level: body.class_level,
          due_date: body.due_date || null,
          max_submissions: body.max_submissions || null,
          password: body.password || null,
          author_id: user.id,
          instructor_id: body.instructor_id || user.id,
          total_students: totalStudents,
        },
      ])
      .select()
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

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("과제 생성 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const url = new URL(request.url)
    const classLevel = url.searchParams.get("class_level")
    const reviewStatus = url.searchParams.get("review_status")

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let query = supabase
      .from("assignments")
      .select(`
        *,
        author:users!author_id(id, name, email),
        instructor:users!instructor_id(id, name, email)
      `)
      .order("created_at", { ascending: false })

    // 클래스 레벨 필터링
    if (classLevel) {
      query = query.eq("class_level", classLevel)
    }

    // 검수 상태 필터링
    if (reviewStatus) {
      query = query.eq("review_status", reviewStatus)
    }

    const { data, error } = await query

    if (error) {
      console.error("과제 목록 조회 오류:", error)
      return NextResponse.json({ error: "과제 목록을 불러올 수 없습니다." }, { status: 500 })
    }

    // 비밀번호 정보 처리
    const processedData = data.map((item) => ({
      ...item,
      has_password: !!item.password,
      password: user && ["admin", "instructor", "teacher"].includes(user.id) ? item.password : undefined,
    }))

    return NextResponse.json(processedData)
  } catch (error) {
    console.error("과제 목록 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
