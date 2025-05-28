import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, content, level, author_id, reviewer_note, attachment_url, password } = body

    // 필수 필드 검증
    if (!title || !content || !level || !author_id || !password) {
      return NextResponse.json({ error: "제목, 내용, 난이도, 작성자, 비밀번호는 필수입니다" }, { status: 400 })
    }

    // 난이도를 유효한 카테고리로 매핑
    const categoryMap: Record<string, string> = {
      beginner: "general",
      intermediate: "tech",
      advanced: "design",
    }

    const category = categoryMap[level] || "general"

    // 첨부파일이나 검토자 노트가 있으면 content에 추가
    let finalContent = content
    if (attachment_url) {
      finalContent += `\n\n📎 첨부파일: ${attachment_url}`
    }
    if (reviewer_note) {
      finalContent += `\n\n📝 검토자 노트: ${reviewer_note}`
    }
    // 비밀번호 정보도 content에 숨겨서 저장 (실제로는 별도 테이블에 저장하는 것이 좋음)
    finalContent += `\n\n🔒 PASSWORD:${password}`

    // 1. board_posts 테이블에 게시글 생성
    const { data: boardPost, error: boardError } = await supabase
      .from("board_posts")
      .insert({
        title,
        content: finalContent,
        category, // 매핑된 유효한 카테고리 사용
        type: "qna", // 과제는 QnA 타입으로 분류
        author_id,
        is_pinned: false,
        likes: 0,
        comments_count: 0,
        views: 0,
      })
      .select()
      .single()

    if (boardError) {
      console.error("Board post creation error:", boardError)
      return NextResponse.json({ error: "과제 게시글 저장에 실패했습니다" }, { status: 500 })
    }

    // 2. assignments 테이블에 과제 상세 정보 저장 (실제 존재하는 컬럼만 사용)
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .insert({
        post_id: boardPost.id,
        class_level: level, // 원본 level 값 저장
        due_date: null,
        is_completed: false,
        submissions_count: 0,
        total_students: 0,
      })
      .select()
      .single()

    if (assignmentError) {
      console.error("Assignment creation error:", assignmentError)
      // 게시글도 롤백
      await supabase.from("board_posts").delete().eq("id", boardPost.id)
      return NextResponse.json({ error: "과제 정보 저장에 실패했습니다" }, { status: 500 })
    }

    // 3. 작성자 정보와 함께 반환
    const { data: authorData } = await supabase.from("users").select("name, email").eq("id", author_id).single()

    const result = {
      ...boardPost,
      assignment: assignment,
      author: {
        name: authorData?.name || "Anonymous",
        avatar: `/placeholder.svg?height=32&width=32&query=${authorData?.name || "user"}`,
      },
    }

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Assignment API error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get("level")

    // 난이도를 카테고리로 매핑
    const categoryMap: Record<string, string> = {
      beginner: "general",
      intermediate: "tech",
      advanced: "design",
    }

    let query = supabase
      .from("board_posts")
      .select(`
        *,
        assignments(*),
        author:users!author_id(name, email)
      `)
      .eq("type", "qna")
      .order("created_at", { ascending: false })

    if (level && categoryMap[level]) {
      query = query.eq("category", categoryMap[level])
    }

    const { data, error } = await query

    if (error) {
      console.error("Assignments fetch error:", error)
      return NextResponse.json({ error: "과제 목록을 불러오는데 실패했습니다" }, { status: 500 })
    }

    const formattedData = data.map((post) => {
      // 비밀번호 추출 및 content에서 제거
      const passwordMatch = post.content.match(/🔒 PASSWORD:(.+)/)
      const password = passwordMatch ? passwordMatch[1].trim() : null
      const cleanContent = post.content.replace(/\n\n🔒 PASSWORD:.+$/, "")

      return {
        ...post,
        content: cleanContent,
        password,
        author: {
          name: post.author?.name || "Anonymous",
          avatar: `/placeholder.svg?height=32&width=32&query=${post.author?.name || "user"}`,
        },
      }
    })

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Assignments GET error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다" }, { status: 500 })
  }
}
