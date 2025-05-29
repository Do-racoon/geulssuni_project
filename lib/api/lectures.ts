import { supabase } from "@/lib/supabase/client"

export interface Lecture {
  id: string
  title: string
  instructor?: string
  instructor_id?: string | null
  description?: string
  thumbnail_url?: string
  video_url?: string
  duration?: number
  price?: number
  is_published?: boolean
  created_at?: string
  updated_at?: string
  content?: string
  category?: string
  tags?: string[]
  views?: number
  location?: string
  capacity?: number
  status?: string
  date?: string
  registrations?: number
}

export async function getLectures() {
  const { data, error } = await supabase
    .from("lectures")
    .select(`
      *,
      author:authors(name, profession),
      instructor:users!instructor_id(name)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getLecture(id: string) {
  const { data, error } = await supabase
    .from("lectures")
    .select(`
      *,
      author:authors(name, profession),
      instructor:users!instructor_id(name)
    `)
    .eq("id", id)
    .eq("is_published", true)
    .single()

  if (error) {
    throw error
  }

  return data
}

// Create a new lecture
export async function createLecture(lecture: Omit<Lecture, "id" | "created_at" | "updated_at">) {
  const lectureData = {
    title: lecture.title,
    description: lecture.description || null,
    thumbnail_url: lecture.thumbnail_url || null,
    video_url: lecture.video_url || null,
    duration: lecture.duration ? Number.parseInt(lecture.duration.toString()) : null,
    price: lecture.price || 0,
    is_published: lecture.status !== "draft",
    instructor_id: lecture.instructor_id || null,
    category: lecture.category || null,
    tags: lecture.tags || null,
    views: 0,
  }

  const { data, error } = await supabase.from("lectures").insert([lectureData]).select()

  if (error) {
    console.error("Error creating lecture:", error)
    throw new Error(`Failed to create lecture: ${error.message}`)
  }

  return data[0]
}

// Update an existing lecture
export async function updateLecture(id: string, lecture: Partial<Omit<Lecture, "id" | "created_at" | "updated_at">>) {
  const lectureData: any = {}

  if (lecture.title !== undefined) lectureData.title = lecture.title
  if (lecture.description !== undefined) lectureData.description = lecture.description
  if (lecture.thumbnail_url !== undefined) lectureData.thumbnail_url = lecture.thumbnail_url
  if (lecture.video_url !== undefined) lectureData.video_url = lecture.video_url
  if (lecture.duration !== undefined) {
    lectureData.duration = lecture.duration ? Number.parseInt(lecture.duration.toString()) : null
  }
  if (lecture.price !== undefined) lectureData.price = lecture.price
  if (lecture.status !== undefined) lectureData.is_published = lecture.status !== "draft"
  if (lecture.category !== undefined) lectureData.category = lecture.category
  if (lecture.tags !== undefined) lectureData.tags = lecture.tags
  if (lecture.instructor_id !== undefined) lectureData.instructor_id = lecture.instructor_id

  lectureData.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("lectures").update(lectureData).eq("id", id).select()

  if (error) {
    console.error("Error updating lecture:", error)
    throw new Error("Failed to update lecture")
  }

  return data[0]
}

// Delete a lecture
export async function deleteLecture(id: string) {
  const { error } = await supabase.from("lectures").delete().eq("id", id)

  if (error) {
    console.error("Error deleting lecture:", error)
    throw new Error("Failed to delete lecture")
  }

  return true
}
