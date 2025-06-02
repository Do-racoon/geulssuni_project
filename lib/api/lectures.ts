import { supabase } from "@/lib/supabase/client"

export interface Lecture {
  id: string
  title: string
  description?: string
  content?: string
  thumbnail_url?: string
  video_url?: string
  duration?: number
  category?: string
  instructor_id?: string
  instructor?: string
  contact_url?: string
  created_at?: string
  updated_at?: string
  is_published?: boolean
  views?: number
  tags?: string[]
}

export async function getLectures() {
  try {
    const { data, error } = await supabase.from("lectures").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching lectures:", error)
      return []
    }

    // Add empty tags array to each lecture if not present
    return data.map((lecture) => ({
      ...lecture,
      tags: lecture.tags || [],
      instructor: lecture.instructor || "Unknown Instructor",
    }))
  } catch (error) {
    console.error("Error in getLectures:", error)
    return []
  }
}

export async function getLecture(id: string) {
  try {
    const { data, error } = await supabase.from("lectures").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching lecture:", error)
      return null
    }

    return {
      ...data,
      tags: data.tags || [],
      instructor: data.instructor || "Unknown Instructor",
    }
  } catch (error) {
    console.error("Error in getLecture:", error)
    return null
  }
}

export async function createLecture(lecture: Partial<Lecture>) {
  try {
    const { data, error } = await supabase.from("lectures").insert([lecture]).select()

    if (error) {
      console.error("Error creating lecture:", error)
      throw new Error(error.message)
    }

    return data[0]
  } catch (error) {
    console.error("Error in createLecture:", error)
    throw error
  }
}

export async function updateLecture(id: string, updates: Partial<Lecture>) {
  try {
    const { data, error } = await supabase
      .from("lectures")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()

    if (error) {
      console.error("Error updating lecture:", error)
      throw new Error(error.message)
    }

    return data[0]
  } catch (error) {
    console.error("Error in updateLecture:", error)
    throw error
  }
}

export async function deleteLecture(id: string) {
  try {
    const { error } = await supabase.from("lectures").delete().eq("id", id)

    if (error) {
      console.error("Error deleting lecture:", error)
      throw new Error(error.message)
    }

    return true
  } catch (error) {
    console.error("Error in deleteLecture:", error)
    throw error
  }
}
