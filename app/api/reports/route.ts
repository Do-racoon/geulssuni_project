import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { postId, userId, reason } = await request.json()

    if (!postId || !userId || !reason) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 이미 신고한 게시글인지 확인
    const { data: existingReport } = await supabase
      .from("reports")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingReport) {
      return NextResponse.json({ error: "이미 신고한 게시글입니다." }, { status: 400 })
    }

    // 신고 추가
    const { error } = await supabase.from("reports").insert({
      post_id: postId,
      user_id: userId,
      reason,
      status: "pending",
    })

    if (error) {
      console.error("Error creating report:", error)
      return NextResponse.json({ error: "신고 접수에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in report API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "pending"

    const supabase = createRouteHandlerClient({ cookies })

    // 관리자 권한 확인 (실제 구현에서는 세션 확인 필요)
    const { data: reports, error } = await supabase
      .from("reports")
      .select(`
        *,
        post:board_posts(id, title, author_id),
        reporter:users!user_id(id, name)
      `)
      .eq("status", status)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching reports:", error)
      return NextResponse.json({ error: "신고 목록 조회에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ reports })
  } catch (error) {
    console.error("Error in reports GET API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
