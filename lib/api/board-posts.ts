import { supabase } from "@/lib/supabase/client"

export interface BoardPost {
  id: string
  title: string
  content: string
  author_id?: string
  author_name: string
  type: "free" | "assignment"
  category?: string
  is_pinned: boolean
  likes: number
  views: number
  created_at?: string
  updated_at?: string
}

export interface Assignment {
  post_id: string
  class_level?: string
  due_date?: string
  is_completed: boolean
  reviewer_memo?: string
  completed_at?: string
  completed_by?: string
}

// Get all board posts
export async function getBoardPosts(type?: "free" | "assignment") {
  let query = supabase.from("board_posts").select("*")

  if (type) {
    query = query.eq("type", type)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching board posts:", error)
    throw new Error("Failed to fetch board posts")
  }

  return data as BoardPost[]
}

// Get a single board post by ID
export async function getBoardPost(id: string) {
  const { data, error } = await supabase.from("board_posts").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching board post:", error)
    throw new Error("Failed to fetch board post")
  }

  return data as BoardPost
}

// Create a new board post
export async function createBoardPost(post: Omit<BoardPost, "id" | "created_at" | "updated_at" | "likes" | "views">) {
  const { data, error } = await supabase
    .from("board_posts")
    .insert([{ ...post, likes: 0, views: 0 }])
    .select()

  if (error) {
    console.error("Error creating board post:", error)
    throw new Error("Failed to create board post")
  }

  return data[0] as BoardPost
}

// Update an existing board post
export async function updateBoardPost(id: string, post: Partial<Omit<BoardPost, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("board_posts")
    .update({ ...post, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating board post:", error)
    throw new Error("Failed to update board post")
  }

  return data[0] as BoardPost
}

// Delete a board post
export async function deleteBoardPost(id: string) {
  const { error } = await supabase.from("board_posts").delete().eq("id", id)

  if (error) {
    console.error("Error deleting board post:", error)
    throw new Error("Failed to delete board post")
  }

  return true
}

// Get assignment details
export async function getAssignment(postId: string) {
  const { data, error } = await supabase.from("assignments").select("*").eq("post_id", postId).single()

  if (error) {
    console.error("Error fetching assignment:", error)
    throw new Error("Failed to fetch assignment")
  }

  return data as Assignment
}

// Create a new assignment
export async function createAssignment(assignment: Assignment) {
  const { data, error } = await supabase.from("assignments").insert([assignment]).select()

  if (error) {
    console.error("Error creating assignment:", error)
    throw new Error("Failed to create assignment")
  }

  return data[0] as Assignment
}

// Update an existing assignment
export async function updateAssignment(postId: string, assignment: Partial<Assignment>) {
  const { data, error } = await supabase.from("assignments").update(assignment).eq("post_id", postId).select()

  if (error) {
    console.error("Error updating assignment:", error)
    throw new Error("Failed to update assignment")
  }

  return data[0] as Assignment
}

// Create a board post with assignment in a transaction
export async function createAssignmentPost(
  post: Omit<BoardPost, "id" | "created_at" | "updated_at" | "likes" | "views" | "type">,
  assignmentDetails: Omit<Assignment, "post_id">,
) {
  // First create the board post
  const boardPost = await createBoardPost({
    ...post,
    type: "assignment",
  })

  // Then create the assignment
  await createAssignment({
    post_id: boardPost.id,
    ...assignmentDetails,
    is_completed: assignmentDetails.is_completed || false,
  })

  return boardPost
}
