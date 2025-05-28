import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, category, type, author_id, image_url } = body

    // 필수 필드 검증
    if (!title || !content || !type || !author_id) {
      return NextResponse.json({ error: "제목, 내용, 타입, 작성자는 필수입니다" }, { status: 400 })
    }

    // board_posts 테이블에 새 게시글 삽입
    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        title,
        content,
        category: category || "general",
        type, // "free" 또는 "assignment"
        author_id,
        image_url,
        is_pinned: false,
        likes: 0,
        comments_count: 0,
        views: 0,
      })
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "게시글 저장에 실패했습니다" }, { status: 500 })
    }

    // 작성자 정보 포맷팅
    const formattedPost = {
      ...data,
      author: {
        name: data.author?.name || "Anonymous",
        avatar: `/placeholder.svg?height=32&width=32&query=${data.author?.name || "user"}`,
      },
    }

    return NextResponse.json(formattedPost, { status: 201 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Board posts API" })
}
