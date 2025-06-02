import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "사용자 ID가 필요합니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 좋아요 상태 확인
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", params.id)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // 좋아요 취소
      await supabase.from("comment_likes").delete().eq("comment_id", params.id).eq("user_id", userId)

      await supabase.rpc("decrement_comment_likes", { comment_id: params.id })

      return NextResponse.json({ isLiked: false })
    } else {
      // 좋아요 추가
      await supabase.from("comment_likes").insert({ comment_id: params.id, user_id: userId })

      await supabase.rpc("increment_comment_likes", { comment_id: params.id })

      return NextResponse.json({ isLiked: true })
    }
  } catch (error) {
    console.error("Error in comment like API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
