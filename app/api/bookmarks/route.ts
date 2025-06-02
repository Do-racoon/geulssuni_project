import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { postId, userId, action } = await request.json()

    if (!postId || !userId || !action) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    if (action === "add") {
      // 북마크 추가
      const { error } = await supabase.from("bookmarks").insert({ post_id: postId, user_id: userId })

      if (error) {
        console.error("Error adding bookmark:", error)
        return NextResponse.json({ error: "북마크 추가에 실패했습니다." }, { status: 500 })
      }
    } else if (action === "remove") {
      // 북마크 제거
      const { error } = await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", userId)

      if (error) {
        console.error("Error removing bookmark:", error)
        return NextResponse.json({ error: "북마크 제거에 실패했습니다." }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in bookmark API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
