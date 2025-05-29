import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // 사용자 권한 확인
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single()

    if (userError) {
      return NextResponse.json({ error: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
    }

// 관리자 또는 강사만 검수 상태 변경 가
