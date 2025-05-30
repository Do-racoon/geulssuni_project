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

    // content에서 이미지 URL 추출 및 검증
    let processedContent = content
    let thumbnailUrl = image_url

    // Rich Editor에서 업로드된 이미지 URL들을 찾아서 검증
    const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g
    const imageMatches = [...content.matchAll(imageRegex)]

    if (imageMatches.length > 0 && !thumbnailUrl) {
      // 첫 번째 이미지를 썸네일로 사용
      const firstImageUrl = imageMatches[0][1]
      if (firstImageUrl && firstImageUrl.includes("supabase")) {
        thumbnailUrl = firstImageUrl
      }
    }

    // 이미지 URL들이 올바른 Supabase URL인지 확인하고 수정
    processedContent = content.replace(/<img([^>]+)src="([^"]+)"([^>]*>)/g, (match, before, src, after) => {
      // Supabase 버킷 URL인지 확인
      if (src.includes("supabase") || src.startsWith("/")) {
        // crossorigin과 loading 속성 추가
        const hasLoading = before.includes("loading=") || after.includes("loading=")
        const hasCrossorigin = before.includes("crossorigin=") || after.includes("crossorigin=")

        let attributes = before + after
        if (!hasLoading) {
          attributes += ' loading="lazy"'
        }
        if (!hasCrossorigin) {
          attributes += ' crossorigin="anonymous"'
        }

        return `<img${attributes}src="${src}">`
      }
      return match
    })

    // board_posts 테이블에 새 게시글 삽입
    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        title,
        content: processedContent,
        category: category || "general",
        type, // "free" 또는 "assignment"
        author_id,
        image_url: thumbnailUrl, // 썸네일 URL 저장
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
