import { supabase } from "@/lib/supabase/client"

export interface Author {
  id: string
  name: string
  profession?: string
  experience?: string
  number_of_works: number
  quote?: string
  instagram_url?: string
  image_url?: string
  image_position_x: number
  image_position_y: number
  likes: number
  created_at?: string
  updated_at?: string
}

export async function getAuthors() {
  const { data, error } = await supabase.from("authors").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching authors:", error)
    throw new Error("Failed to fetch authors")
  }

  return data as Author[]
}

export async function getAuthor(id: string) {
  const { data, error } = await supabase.from("authors").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching author:", error)
    throw new Error("Failed to fetch author")
  }

  return data as Author
}

export async function createAuthor(author: Omit<Author, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("authors").insert([author]).select().single()

  if (error) {
    console.error("Error creating author:", error)
    throw new Error("Failed to create author")
  }

  return data as Author
}

export async function updateAuthor(id: string, author: Partial<Omit<Author, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("authors")
    .update({ ...author, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating author:", error)
    throw new Error("Failed to update author")
  }

  return data as Author
}

export async function deleteAuthor(id: string) {
  const { error } = await supabase.from("authors").delete().eq("id", id)

  if (error) {
    console.error("Error deleting author:", error)
    throw new Error("Failed to delete author")
  }

  return true
}
