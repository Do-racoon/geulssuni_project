import { supabase } from "@/lib/supabase/client"

export interface Instructor {
  id: string
  name: string
  profession?: string
  image_url?: string
  experience?: string
  quote?: string
  instagram_url?: string
  likes?: number
  number_of_works?: number
  created_at?: string
  updated_at?: string
}

// Get all instructors (authors)
export async function getInstructors() {
  const { data, error } = await supabase.from("authors").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching instructors:", error)
    throw new Error("Failed to fetch instructors")
  }

  return data as Instructor[]
}

// Get a single instructor by ID
export async function getInstructor(id: string) {
  const { data, error } = await supabase.from("authors").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching instructor:", error)
    throw new Error("Failed to fetch instructor")
  }

  return data as Instructor
}

// Create a new instructor
export async function createInstructor(instructor: Omit<Instructor, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("authors").insert([instructor]).select()

  if (error) {
    console.error("Error creating instructor:", error)
    throw new Error("Failed to create instructor")
  }

  return data[0] as Instructor
}

// Update an existing instructor
export async function updateInstructor(
  id: string,
  instructor: Partial<Omit<Instructor, "id" | "created_at" | "updated_at">>,
) {
  const { data, error } = await supabase
    .from("authors")
    .update({
      ...instructor,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating instructor:", error)
    throw new Error("Failed to update instructor")
  }

  return data[0] as Instructor
}

// Delete an instructor
export async function deleteInstructor(id: string) {
  const { error } = await supabase.from("authors").delete().eq("id", id)

  if (error) {
    console.error("Error deleting instructor:", error)
    throw new Error("Failed to delete instructor")
  }

  return true
}
