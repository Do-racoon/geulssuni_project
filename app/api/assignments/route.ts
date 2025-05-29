import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 로그인한 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 사용자 프로필 정보 가져오기
    const { data: profile } = await supabase.from("users").select("*").eq("id", user?.id).single()

    // 관리자 또는 강사인지 확인
    const isAdminOrInstructor = profile?.role === "admin" || profile?.role === "instructor"

    // URL 쿼리 파라미터 가져오기
    const url = new URL(request.url)
    const level = url.searchParams.get("level")

    // 기본 쿼리 설정
    let query = supabase
      .from("board_posts")
      .select(`
    *,
    assignments(*),
    author:users!author_id(name, email)
  `)
      .eq("type", "assignment")
      .order("created_at", { ascending: false })

    // 레벨 필터링 적용
    if (level && level !== "all") {
      query = query.eq("category", level)
    } else if (!isAdminOrInstructor && profile?.class_level) {
      // 일반 사용자는 자신의 레벨에 맞는 과제만 볼 수 있음
      query = query.eq("category", profile.class_level)
    }

    // 쿼리 실행
    const { data, error } = await query

    if (error) {
      console.error("과제 목록 조회 오류:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // 디버그 정보
    console.log(
      `과제 ${data?.length || 0}개 조회됨, 필터: ${level || "없음"}, 사용자 레벨: ${profile?.class_level || "없음"}`,
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("과제 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
