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
    const formData = await request.formData()

    const studentName = formData.get("studentName") as string
    const comment = formData.get("comment") as string
    const file = formData.get("file") as File

    if (!studentName || !file) {
      return NextResponse.json({ error: "학생 이름과 파일은 필수입니다." }, { status: 400 })
    }

    // 서버 사이드 Supabase 클라이언트 생성
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // 파일 업로드
    const fileExt = file.name.split(".").pop()
    const fileName = `assignments/${assignmentId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage.from("uploads").upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("파일 업로드 오류:", uploadError)
      return NextResponse.json({ error: "파일 업로드에 실패했습니다." }, { status: 500 })
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from("uploads").getPublicUrl(fileName)

    // 제출 정보 저장 (student_id 없이)
    const { data: submission, error: submissionError } = await supabase
      .from("assignment_submissions")
      .insert([
        {
          assignment_id: assignmentId,
          student_name: studentName,
          file_name: file.name,
          file_url: publicUrl,
          comment: comment || null,
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

    return NextResponse.json({ success: true, submission })
  } catch (error) {
    console.error("제출 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
