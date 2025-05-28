import { supabase } from "@/lib/supabase/client"

export interface LectureContent {
  id: string
  lecture_id: string
  content: string
  created_at: string
  updated_at: string
}

// Get content for a lecture
export async function getLectureContent(lectureId: string) {
  const { data, error } = await supabase.from("lecture_contents").select("*").eq("lecture_id", lectureId).single()

  if (error) {
    if (error.code === "PGRST116") {
      // No content found, return null
      return null
    }
    console.error("Error fetching lecture content:", error)
    throw new Error("Failed to fetch lecture content")
  }

  return data as LectureContent
}

// Create or update lecture content
export async function upsertLectureContent(lectureId: string, content: string) {
  const { data, error } = await supabase
    .from("lecture_contents")
    .upsert({
      lecture_id: lectureId,
      content,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (error) {
    console.error("Error upserting lecture content:", error)
    throw new Error("Failed to save lecture content")
  }

  return data[0] as LectureContent
}

// Delete lecture content
export async function deleteLectureContent(lectureId: string) {
  const { error } = await supabase.from("lecture_contents").delete().eq("lecture_id", lectureId)

  if (error) {
    console.error("Error deleting lecture content:", error)
    throw new Error("Failed to delete lecture content")
  }

  return true
}
