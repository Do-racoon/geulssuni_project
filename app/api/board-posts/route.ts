import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    let query = supabase
      .from("board_posts")
      .select(`
        *,
        users!board_posts_author_id_fkey(name)
      `)
      .order("created_at", { ascending: false })

    if (type) {
      query = query.eq("type", type)
    }

    const { data, error } = await query

    if (error) {
      throw error
    }

    // Transform data to include author name
    const transformedData = data.map((post) => ({
      ...post,
      author_name: post.users?.name || "Unknown",
      comments_count: 0, // TODO: Implement comments count
      likes_count: 0, // TODO: Implement likes count
      submissions_count: 0, // TODO: Implement submissions count
      total_students: 0, // TODO: Implement total students count
      reviewer_notes: [], // TODO: Implement reviewer notes
    }))

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("Error fetching board posts:", error)
    return NextResponse.json({ error: "Failed to fetch board posts" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("board_posts")
      .insert({
        ...body,
        author_id: user.id,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error creating board post:", error)
    return NextResponse.json({ error: "Failed to create board post" }, { status: 500 })
  }
}
