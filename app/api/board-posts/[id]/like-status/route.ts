import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 좋아요 상태 확인
    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", params.id)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116는 결과가 없을 때 발생하는 에러 코드
      console.error("Error checking like status:", error)
      return NextResponse.json({ error: "좋아요 상태 확인 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ isLiked: !!data })
  } catch (error) {
    console.error("Error checking like status:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
