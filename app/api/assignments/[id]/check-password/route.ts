import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 })
    }

    // 과제의 비밀번호 확인
    const { data: assignment, error } = await supabase
      .from("board_posts")
      .select("password")
      .eq("id", params.id)
      .eq("category", "assignment")
      .single()

    if (error || !assignment) {
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호 확인
    if (assignment.password === password) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("Password check error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
