import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const { id } = params

    console.log("Updating report:", id, "to status:", status)

    if (!status || !["pending", "reviewed", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 관리자 권한 확인 (실제 구현에서는 세션 확인 필요)
    const { data: report, error } = await supabase
      .from("reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating report:", error)
      return NextResponse.json({ error: "신고 상태 업데이트에 실패했습니다." }, { status: 500 })
    }

    console.log("Report updated successfully:", report)
    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error in report PUT API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const { id } = params

    if (!status || !["pending", "reviewed", "resolved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "유효하지 않은 상태입니다." }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // 관리자 권한 확인 (실제 구현에서는 세션 확인 필요)
    const { data: report, error } = await supabase
      .from("reports")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating report:", error)
      return NextResponse.json({ error: "신고 상태 업데이트에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error in report PATCH API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const supabase = createRouteHandlerClient({ cookies })

    // 관리자 권한 확인 (실제 구현에서는 세션 확인 필요)
    const { error } = await supabase.from("reports").delete().eq("id", id)

    if (error) {
      console.error("Error deleting report:", error)
      return NextResponse.json({ error: "신고 삭제에 실패했습니다." }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in report DELETE API:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
