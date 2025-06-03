import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"

export async function DELETE(request: NextRequest, { params }: { params: { id: string; submissionId: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const user = await getCurrentUser()

    // 관리자 권한 확인
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 })
    }

    const { id: assignmentId, submissionId } = params

    // 제출물 삭제
    const { error: deleteError } = await supabase
      .from("assignment_submissions")
      .delete()
      .eq("id", submissionId)
      .eq("assignment_id", assignmentId)

    if (deleteError) {
      console.error("Error deleting submission:", deleteError)
      return NextResponse.json({ error: `제출물 삭제 오류: ${deleteError.message}` }, { status: 500 })
    }

    // 제출 수 감소 함수 호출
    const { error: decrementError } = await supabase.rpc("decrement_assignment_submissions", {
      assignment_id: assignmentId,
    })

    if (decrementError) {
      console.error("Error decrementing submission count:", decrementError)
      return NextResponse.json({ error: `제출 수 업데이트 오류: ${decrementError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE handler:", error)
    return NextResponse.json(
      { error: `서버 오류: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}
