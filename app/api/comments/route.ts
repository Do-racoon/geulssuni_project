import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { postId, content, userId } = await request.json()

    if (!postId || !content || !userId) {
      return NextResponse.json({ error: "필수 정보가 누락되었습니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 댓글 생성
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content,
        author_id: userId,
      })
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return NextResponse.json({ error: "댓글 작성에 실패했습니다." }, { status: 500 })
    }

    // 게시글의 댓글 수 증가
    await supabase.rpc("increment_post_comments", { post_id: postId })

    return NextResponse.json({ comment: data })
  } catch (error) {
    console.error("Error in comment API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get("postId")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const perPage = Number.parseInt(searchParams.get("perPage") || "10")

    if (!postId) {
      return NextResponse.json({ error: "게시글 ID가 필요합니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 총 댓글 수 가져오기
    const { count, error: countError } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("post_id", postId)

    if (countError) {
      console.error("Error counting comments:", countError)
      return NextResponse.json({ error: "댓글 수 조회에 실패했습니다." }, { status: 500 })
    }

    // 페이지네이션 계산
    const totalPages = Math.ceil((count || 0) / perPage)
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // 댓글 가져오기
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Error fetching comments:", error)
      return NextResponse.json({ error: "댓글 조회에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({
      comments: comments || [],
      totalPages,
      currentPage: page,
      totalCount: count || 0,
    })
  } catch (error) {
    console.error("Error in comments GET API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
