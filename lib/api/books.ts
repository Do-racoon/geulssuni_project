import { supabase } from "@/lib/supabase/client"
import type { Book } from "@/types"

export async function getBooks() {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  if (error) {
    throw error
  }

  return data
}

export async function getBook(id: string) {
  const { data, error } = await supabase.from("books").select("*").eq("id", id).eq("is_published", true).single()

  if (error) {
    throw error
  }

  return data
}

export async function getBooksByTags(tags: string[], excludeId?: string, limit = 6) {
  let query = supabase.from("books").select("*").eq("is_published", true).overlaps("tags", tags).limit(limit)

  if (excludeId) {
    query = query.neq("id", excludeId)
  }

  const { data, error } = await query

  if (error) {
    throw error
  }

  return data || []
}

export async function incrementBookViews(id: string) {
  const { error } = await supabase.rpc("increment_book_views", { book_id: id })

  if (error) {
    console.error("Error incrementing book views:", error)
  }
}

// Create a new book (admin only)
export async function createBook(book: Omit<Book, "id" | "created_at" | "updated_at" | "views" | "sales_count">) {
  try {
    const { data, error } = await supabase
      .from("books")
      .insert([
        {
          ...book,
          views: 0,
          sales_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select("*")

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create book: ${error.message}`)
    }

    return data[0]
  } catch (error) {
    console.error("Error creating book:", error)
    throw error
  }
}

// Update an existing book (admin only)
export async function updateBook(id: string, book: Partial<Omit<Book, "id" | "created_at" | "updated_at">>) {
  try {
    const { data, error } = await supabase
      .from("books")
      .update({
        ...book,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update book: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Book not found")
    }

    return data[0]
  } catch (error) {
    console.error("Error updating book:", error)
    throw error
  }
}

// Delete a book (admin only)
export async function deleteBook(id: string) {
  try {
    const { error } = await supabase.from("books").delete().eq("id", id)

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to delete book: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting book:", error)
    throw error
  }
}

// Increment book sales
export async function incrementBookSales(id: string) {
  try {
    const { error } = await supabase.rpc("increment_book_sales", { book_id: id })

    if (error) {
      console.error("Error incrementing sales:", error)
    }
  } catch (error) {
    console.error("Error incrementing book sales:", error)
  }
}
