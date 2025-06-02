import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: commentId } = params
    const { user_id, is_admin } = await request.json()

    if (!user_id) {
      return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 댓글 정보 조회
    const { data: comment, error: fetchError } = await supabase
      .from("submission_comments")
      .select("author_id")
      .eq("id", commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json({ error: "댓글을 찾을 수 없습니다." }, { status: 404 })
    }

    // 권한 확인: 작성자이거나 관리자인 경우만 삭제 가능
    if (comment.author_id !== user_id && !is_admin) {
      return NextResponse.json({ error: "댓글을 삭제할 권한이 없습니다." }, { status: 403 })
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase.from("submission_comments").delete().eq("id", commentId)

    if (deleteError) {
      console.error("댓글 삭제 오류:", deleteError)
      return NextResponse.json({ error: "댓글 삭제 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "댓글이 삭제되었습니다.",
    })
  } catch (error) {
    console.error("댓글 삭제 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
