import { supabase } from "@/lib/supabase/client"

export interface Lecture {
  id: string
  title: string
  instructor: string
  description?: string
  content?: string
  thumbnail_url?: string
  duration?: number
  category?: string
  likes: number
  created_at?: string
  updated_at?: string
}

// Get all lectures
export async function getLectures() {
  const { data, error } = await supabase.from("lectures").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching lectures:", error)
    throw new Error("Failed to fetch lectures")
  }

  return data as Lecture[]
}

// Get a single lecture by ID
export async function getLecture(id: string) {
  const { data, error } = await supabase.from("lectures").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching lecture:", error)
    throw new Error("Failed to fetch lecture")
  }

  return data as Lecture
}

// Create a new lecture
export async function createLecture(lecture: Omit<Lecture, "id" | "created_at" | "updated_at" | "likes">) {
  const { data, error } = await supabase
    .from("lectures")
    .insert([{ ...lecture, likes: 0 }])
    .select()

  if (error) {
    console.error("Error creating lecture:", error)
    throw new Error("Failed to create lecture")
  }

  return data[0] as Lecture
}

// Update an existing lecture
export async function updateLecture(id: string, lecture: Partial<Omit<Lecture, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("lectures")
    .update({ ...lecture, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating lecture:", error)
    throw new Error("Failed to update lecture")
  }

  return data[0] as Lecture
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
