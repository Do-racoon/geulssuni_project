import { supabase } from "@/lib/supabase/client"

export interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  is_published: boolean
  created_at?: string
  updated_at?: string
}

// Get all FAQs
export async function getFAQs(publishedOnly = false) {
  let query = supabase.from("faqs").select("*")

  if (publishedOnly) {
    query = query.eq("is_published", true)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching FAQs:", error)
    throw new Error("Failed to fetch FAQs")
  }

  return data as FAQ[]
}

// Get a single FAQ by ID
export async function getFAQ(id: string) {
  const { data, error } = await supabase.from("faqs").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching FAQ:", error)
    throw new Error("Failed to fetch FAQ")
  }

  return data as FAQ
}

// Create a new FAQ
export async function createFAQ(faq: Omit<FAQ, "id" | "created_at" | "updated_at">) {
  const { data, error } = await supabase.from("faqs").insert([faq]).select()

  if (error) {
    console.error("Error creating FAQ:", error)
    throw new Error("Failed to create FAQ")
  }

  return data[0] as FAQ
}

// Update an existing FAQ
export async function updateFAQ(id: string, faq: Partial<Omit<FAQ, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("faqs")
    .update({ ...faq, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating FAQ:", error)
    throw new Error("Failed to update FAQ")
  }

  return data[0] as FAQ
}

// Delete a FAQ
export async function deleteFAQ(id: string) {
  const { error } = await supabase.from("faqs").delete().eq("id", id)

  if (error) {
    console.error("Error deleting FAQ:", error)
    throw new Error("Failed to delete FAQ")
  }

  return true
}
