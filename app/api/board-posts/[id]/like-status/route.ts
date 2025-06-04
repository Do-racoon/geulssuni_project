import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  console.log(`[API] Checking like status for post: ${params.id}`)

  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      console.log(`[API] No userId provided for like status check`)
      return NextResponse.json({ isLiked: false })
    }

    console.log(`[API] Checking like status for user: ${userId}, post: ${params.id}`)

    const { data, error } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", params.id)
      .eq("user_id", userId)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error(`[API] Error checking like status:`, error)
      return NextResponse.json({ error: "Failed to check like status" }, { status: 500 })
    }

    const isLiked = !!data
    console.log(`[API] Like status result: ${isLiked}`)

    return NextResponse.json({ isLiked })
  } catch (error) {
    console.error(`[API] Unexpected error checking like status:`, error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
