import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 사용자 세션 확인
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError) {
      console.error("User data error:", userError)
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
    }

    // 관리자 권한 확인
    if (userData.role !== "admin") {
      console.error("Access denied. User role:", userData.role)
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    console.log("Admin access granted for user:", session.user.email)

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

    console.log("Assignments fetched successfully:", assignments?.length || 0)
    return NextResponse.json(assignments || [])
  } catch (error) {
    console.error("과제 목록 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
