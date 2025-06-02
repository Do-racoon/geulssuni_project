import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: submissionId } = params
    const { content, author_name, author_id } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: "댓글 내용이 필요합니다." }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // submission_comments 테이블에 댓글 저장
    const { data, error } = await supabase
      .from("submission_comments")
      .insert({
        submission_id: submissionId,
        author_name: author_name || "Anonymous",
        author_id: author_id || null,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error("댓글 저장 오류:", error)
      return NextResponse.json({ error: "댓글을 저장하는 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "댓글이 추가되었습니다.",
      comment: data[0],
    })
  } catch (error) {
    console.error("댓글 추가 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: submissionId } = params

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 특정 제출물의 모든 댓글 조회
    const { data, error } = await supabase
      .from("submission_comments")
      .select("*")
      .eq("submission_id", submissionId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("댓글 조회 오류:", error)
      return NextResponse.json({ error: "댓글을 조회하는 중 오류가 발생했습니다." }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("댓글 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
