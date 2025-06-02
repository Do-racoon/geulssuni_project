import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

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

    // 사용자 정보를 저장할 변수
    let userId: string
    let userRole: string

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

      // 이메일로 찾은 사용자 정보 사용
      userId = userByEmail.id
      userRole = userByEmail.role
    } else {
      // 기존 사용자 정보 사용
      userId = dbUser.id
      userRole = dbUser.role
    }

    // 권한 확인 (관리자 또는 강사만 검수 가능)
    if (!["admin", "instructor", "teacher"].includes(userRole)) {
      return NextResponse.json({ error: "검수 권한이 없습니다." }, { status: 403 })
    }

    // 현재 과제 상태 가져오기
    const { data: assignment, error: fetchError } = await supabase
      .from("assignments")
      .select("review_status")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 검수 상태 토글
    const newStatus = assignment.review_status === "completed" ? "pending" : "completed"
    const updateData: any = {
      review_status: newStatus,
      updated_at: new Date().toISOString(),
    }

    // 검수 완료 시 검수자와 검수일 기록
    if (newStatus === "completed") {
      updateData.reviewed_by = userId
      updateData.reviewed_at = new Date().toISOString()
    } else {
      updateData.reviewed_by = null
      updateData.reviewed_at = null
    }

    const { data, error } = await supabase
      .from("assignments")
      .update(updateData)
      .eq("id", params.id)
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 검수 상태 업데이트 오류:", error)
      return NextResponse.json({ error: "검수 상태를 업데이트할 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("과제 검수 상태 변경 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
