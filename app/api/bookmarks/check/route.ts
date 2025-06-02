import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const userId = searchParams.get("userId")

    if (!postId || !userId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    const { data, error } = await supabase
      .from("bookmarks")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error checking bookmark status:", error)
      return NextResponse.json({ error: "북마크 상태 확인 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ isBookmarked: !!data })
  } catch (error) {
    console.error("Error in bookmark check API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
