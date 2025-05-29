import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

// 과제 제출 목록 조회
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id

    // 현재 사용자 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // 로그인하지 않은 경우에도 제출 목록 조회 가능 (관리자/강사만)
    if (user) {
      const { data: dbUser } = await supabase.from("users").select("role").eq("id", user.id).single()

      if (dbUser && ["admin", "instructor", "teacher"].includes(dbUser.role)) {
        // 관리자/강사는 모든 제출 목록 조회
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
      }

      // 일반 사용자는 자신의 제출만 조회 가능
      const { data: submissions, error } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", assignmentId)
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false })

      if (error) {
        console.error("제출 목록 조회 오류:", error)
        return NextResponse.json({ error: "제출 목록을 불러올 수 없습니다." }, { status: 500 })
      }

      return NextResponse.json(submissions || [])
    }

    // 로그인하지 않은 경우 빈 배열 반환
    return NextResponse.json([])
  } catch (error) {
    console.error("제출 목록 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

// 과제 제출 - 로그인 없이도 가능
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const assignmentId = params.id
    const body = await request.json()

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
    if (assignment.due_date && new Date(assignment.due_date) < new Date()) {
      return NextResponse.json({ error: "제출 마감일이 지났습니다." }, { status: 400 })
    }

    // 제출 인원 확인
    if (assignment.max_submissions > 0 && assignment.current_submissions >= assignment.max_submissions) {
      return NextResponse.json({ error: "제출 인원이 마감되었습니다." }, { status: 400 })
    }

    // 중복 제출 확인 - studentId가 있으면 ID로, 없으면 이름으로 확인
    let existingSubmission = null

    if (body.studentId) {
      const { data } = await supabase
        .from("assignment_submissions")
        .select("id")
        .eq("assignment_id", assignmentId)
        .eq("student_id", body.studentId)
        .single()
      existingSubmission = data
    } else {
      // 로그인하지 않은 사용자는 이름으로 중복 확인
      const { data } = await supabase
        .from("assignment_submissions")
        .select("id")
        .eq("assignment_id", assignmentId)
        .eq("student_name", body.studentName)
        .single()
      existingSubmission = data
    }

    if (existingSubmission) {
      return NextResponse.json({ error: "이미 제출한 과제입니다." }, { status: 400 })
    }

    // 제출 데이터 생성
    const submissionData = {
      assignment_id: assignmentId,
      student_id: body.studentId || null, // null로 설정 (UUID 타입이므로)
      student_name: body.studentName,
      file_url: body.fileUrl,
      file_name: body.fileName,
      comment: body.comment || null,
    }

    const { data, error } = await supabase.from("assignment_submissions").insert([submissionData]).select().single()

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
