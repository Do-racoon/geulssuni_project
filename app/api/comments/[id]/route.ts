import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 댓글 정보 가져오기 (게시글 ID와 권한 확인용)
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("post_id, author_id")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Error fetching comment:", fetchError)
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 })
    }

    // 댓글 삭제 (권한 확인은 클라이언트에서 처리)
    const { error } = await supabase.from("comments").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting comment:", error)
      return NextResponse.json({ error: "댓글 삭제에 실패했습니다." }, { status: 500 })
    }

    // 게시글의 댓글 수 감소
    if (comment?.post_id) {
      await supabase.rpc("decrement_post_comments", { post_id: comment.post_id })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in comment delete API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
