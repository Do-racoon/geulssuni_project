import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// 과제 제출 목록 조회
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id

    const { data: submissions, error } = await supabase
      .from("assignment_submissions")
      .select(`
        *,
        student:users!student_id(name, email),
        checked_by_user:users!checked_by(name, email)
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

// 과제 제출
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id
    const body = await request.json()

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 })
    }

    // 과제 정보 확인
    const { data: assignment, error: assignmentError } = await supabase
      .from("assignments")
      .select("due_date, max_submissions, current_submissions")
      .eq("id", assignmentId)
      .single()

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 마감일 확인
    if (new Date(assignment.due_date) < new Date()) {
      return NextResponse.json({ error: "제출 마감일이 지났습니다." }, { status: 400 })
    }

    // 제출 인원 확인
    if (assignment.current_submissions >= assignment.max_submissions) {
      return NextResponse.json({ error: "제출 인원이 마감되었습니다." }, { status: 400 })
    }

    // 이미 제출했는지 확인
    const { data: existingSubmission } = await supabase
      .from("assignment_submissions")
      .select("id")
      .eq("assignment_id", assignmentId)
      .eq("student_id", user.id)
      .single()

    if (existingSubmission) {
      return NextResponse.json({ error: "이미 제출한 과제입니다." }, { status: 400 })
    }

    // 제출 데이터 생성
    const submissionData = {
      assignment_id: assignmentId,
      student_id: user.id,
      student_name: body.student_name,
      file_url: body.file_url,
      file_name: body.file_name,
    }

    const { data, error } = await supabase
      .from("assignment_submissions")
      .insert([submissionData])
      .select(`
        *,
        student:users!student_id(name, email)
      `)
      .single()

    if (error) {
      console.error("과제 제출 오류:", error)
      return NextResponse.json({ error: "과제 제출에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("과제 제출 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
