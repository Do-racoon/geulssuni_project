import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: assignmentId } = params

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 과제의 모든 제출물 조회
    const { data: submissions, error: submissionsError } = await supabase
      .from("assignment_submissions")
      .select("id, student_name, file_name, file_url, comment, submitted_at, created_at")
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })

    if (submissionsError) {
      console.error("제출물 조회 오류:", submissionsError)
      return NextResponse.json({ error: "제출물을 조회하는 중 오류가 발생했습니다." }, { status: 500 })
    }

    // 각 제출물의 댓글 조회
    const submissionsWithComments = await Promise.all(
      submissions.map(async (submission) => {
        const { data: comments, error: commentsError } = await supabase
          .from("submission_comments")
          .select("id, author_name, content, created_at")
          .eq("submission_id", submission.id)
          .order("created_at", { ascending: true })

        if (commentsError) {
          console.error(`제출물 ${submission.id}의 댓글 조회 오류:`, commentsError)
          return { ...submission, comments: [] }
        }

        return { ...submission, comments }
      }),
    )

    return NextResponse.json(submissionsWithComments)
  } catch (error) {
    console.error("제출물 조회 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
