import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    // Check if user is admin or teacher
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (!userData || !["admin", "teacher"].includes(userData.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get current reviewer notes
    const { data: currentPost } = await supabase
      .from("board_posts")
      .select("reviewer_notes")
      .eq("id", params.id)
      .single()

    const currentNotes = currentPost?.reviewer_notes || []
    const newNote = `[${new Date().toLocaleString()}] ${body.note}`
    const updatedNotes = [...currentNotes, newNote]

    const { data, error } = await supabase
      .from("board_posts")
      .update({ reviewer_notes: updatedNotes })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error adding reviewer note:", error)
    return NextResponse.json({ error: "Failed to add reviewer note" }, { status: 500 })
  }
}
