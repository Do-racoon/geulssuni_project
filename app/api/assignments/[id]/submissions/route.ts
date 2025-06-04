import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: assignmentId } = params

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: submissions, error } = await supabase
      .from("assignment_submissions")
      .select(`
        id,
        student_name,
        file_name,
        file_url,
        submitted_at,
        is_checked,
        checked_by,
        checked_at,
        comment,
        feedback,
        student:users!student_id(id, name, email),
        checked_by_user:users!checked_by(id, name, email)
      `)
      .eq("assignment_id", assignmentId)
      .order("submitted_at", { ascending: false })

    if (error) {
      console.error("제출 목록 조회 오류:", error)
      return NextResponse.json({ error: "제출 목록을 불러올 수 없습니다." }, { status: 500 })
    }

    return NextResponse.json(submissions || [])
  } catch (error) {
    console.error("제출 목록 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: assignmentId } = params

    // Content-Type 확인
    const contentType = request.headers.get("content-type")
    console.log("Content-Type:", contentType)

    let studentName: string
    let fileName: string
    let fileUrl: string
    let studentId: string | null = null
    let comment: string | null = null

    if (contentType?.includes("application/json")) {
      // JSON 형식으로 받는 경우
      const body = await request.json()
      console.log("JSON 요청 본문:", body)

      studentName = body.studentName
      fileName = body.fileName
      fileUrl = body.fileUrl
      studentId = body.studentId || null
      comment = body.comment || null
    } else {
      // FormData 형식으로 받는 경우
      const formData = await request.formData()
      console.log("FormData 요청")

      studentName = formData.get("studentName") as string
      fileName = formData.get("fileName") as string
      fileUrl = formData.get("fileUrl") as string
      studentId = (formData.get("studentId") as string) || null
      comment = (formData.get("comment") as string) || null
    }

    if (!studentName || !fileName || !fileUrl) {
      console.error("필수 필드 누락:", { studentName, fileName, fileUrl })
      return NextResponse.json({ error: "학생 이름, 파일명, 파일 URL은 필수입니다." }, { status: 400 })
    }

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 현재 제출 수 다시 확인 (동시성 문제 방지)
    const { data: currentAssignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("max_submissions, current_submissions")
      .eq("id", assignmentId)
      .single()

    if (assignmentError) {
      console.error("과제 정보 조회 오류:", assignmentError)
      return NextResponse.json({ error: "과제 정보를 불러올 수 없습니다." }, { status: 500 })
    }

    if (
      currentAssignment?.max_submissions &&
      currentAssignment.current_submissions >= currentAssignment.max_submissions
    ) {
      return NextResponse.json({ error: "제출 인원이 마감되었습니다." }, { status: 400 })
    }

    // 제출 정보 저장
    const { data: submission, error: submissionError } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id: assignmentId,
          student_id: studentId,
          student_name: studentName,
          file_name: fileName,
          file_url: fileUrl,
          comment: comment,
          submitted_at: new Date().toISOString(),
          is_checked: false,
        },
      ])
      .select()
      .single()

    if (submissionError) {
      console.error("제출 정보 저장 오류:", submissionError)
      return NextResponse.json({ error: "제출 정보 저장에 실패했습니다." }, { status: 500 })
    }

    // 제출 정보 저장 후 current_submissions 증가
    if (submission) {
      const { error: updateError } = await supabase
        .from("assignments")
        .update({
          current_submissions: (currentAssignment?.current_submissions || 0) + 1,
        })
        .eq("id", assignmentId)

      if (updateError) {
        console.error("제출 수 업데이트 오류:", updateError)
        // 제출은 성공했지만 카운트 업데이트 실패 - 경고만 로그
      }
    }

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("제출 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
