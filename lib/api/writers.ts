import { createClient } from "@/lib/supabase/client"

export interface Writer {
  id: string
  name: string
  profession: string
  experience: string
  number_of_works: number
  quote?: string
  instagram_url?: string
  image_url?: string
  image_position_x?: number
  image_position_y?: number
  likes: number
  created_at?: string
  updated_at?: string
}

export interface CreateWriterData {
  name: string
  profession: string
  experience: string
  number_of_works: number
  quote?: string
  instagram_url?: string
  image_url?: string
  image_position_x?: number
  image_position_y?: number
}

export interface UpdateWriterData {
  name?: string
  profession?: string
  experience?: string
  number_of_works?: number
  quote?: string
  instagram_url?: string
  image_url?: string
  image_position_x?: number
  image_position_y?: number
}

export async function getWriters(): Promise<Writer[]> {
  const supabase = createClient()

  const { data, error } = await supabase.from("writers").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching writers:", error)
    throw error
  }

  return data || []
}

export async function getWriter(id: string): Promise<Writer> {
  const supabase = createClient()

  const { data, error } = await supabase.from("writers").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching writer:", error)
    throw error
  }

  return data
}

export async function createWriter(writerData: CreateWriterData): Promise<Writer> {
  const supabase = createClient()

  const { data, error } = await supabase.from("writers").insert([writerData]).select().single()

  if (error) {
    console.error("Error creating writer:", error)
    throw error
  }

  return data
}

export async function updateWriter(id: string, writerData: UpdateWriterData): Promise<Writer> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("writers")
    .update({ ...writerData, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating writer:", error)
    throw error
  }

  return data
}

export async function deleteWriter(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("writers").delete().eq("id", id)

  if (error) {
    console.error("Error deleting writer:", error)
    throw error
  }
}

export async function incrementWriterLikes(id: string): Promise<Writer> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("writers")
    .update({ likes: supabase.sql`likes + 1` })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error incrementing writer likes:", error)
    throw error
  }

  return data
}
