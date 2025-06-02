import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// 게시글 삭제 API
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // 현재 로그인한 사용자 확인
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 })
    }

    // 사용자 권한 확인
    const { data: userData } = await supabase.from("users").select("id, role").eq("id", user.id).single()

    // 게시글 정보 가져오기
    const { data: post, error: postError } = await supabase
      .from("board_posts")
      .select("author_id")
      .eq("id", params.id)
      .single()

    if (postError) {
      return NextResponse.json({ error: "게시글을 찾을 수 없습니다." }, { status: 404 })
    }

    // 작성자 또는 관리자만 삭제 가능
    const isAdmin = userData?.role === "admin"
    const isAuthor = post.author_id === userData?.id

    if (!isAdmin && !isAuthor) {
      return NextResponse.json({ error: "삭제 권한이 없습니다." }, { status: 403 })
    }

    // 게시글 삭제
    const { error: deleteError } = await supabase.from("board_posts").delete().eq("id", params.id)

    if (deleteError) {
      return NextResponse.json({ error: "게시글 삭제 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
