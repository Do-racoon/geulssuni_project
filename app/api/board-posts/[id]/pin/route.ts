import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { data, error } = await supabase
      .from("board_posts")
      .update({ is_pinned: body.is_pinned })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating pin status:", error)
    return NextResponse.json({ error: "Failed to update pin status" }, { status: 500 })
  }
}
