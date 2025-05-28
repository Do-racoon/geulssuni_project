import { supabase } from "@/lib/supabase/client"

export interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  views: number
  category?: string
  pages?: number
  purchase_link?: string
  tags?: string[]
  is_published: boolean
  created_at?: string
  updated_at?: string
  sales_count?: number // 추가
  external_link?: string // 추가
}

// Get all published books
export async function getBooks() {
  try {
    const { data, error } = await supabase
      .from("books")
      .select(
        "id, title, author, description, cover_url, views, category, pages, is_published, created_at, updated_at, purchase_link, tags, sales_count, external_link",
      )
      .eq("is_published", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Book[]
  } catch (error) {
    console.error("Error fetching books:", error)
    throw error
  }
}

// Get a single book by ID
export async function getBook(id: string) {
  try {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(id)) {
      throw new Error("Invalid book ID format")
    }

    const { data, error } = await supabase
      .from("books")
      .select(
        "id, title, author, description, cover_url, views, category, pages, is_published, created_at, updated_at, purchase_link, tags, sales_count, external_link",
      )
      .eq("id", id)
      .eq("is_published", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        throw new Error("Book not found")
      }
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Book
  } catch (error) {
    console.error("Error fetching book:", error)
    throw error
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
      .select(
        "id, title, author, description, cover_url, views, category, pages, is_published, created_at, updated_at, purchase_link, tags, sales_count, external_link",
      )

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to create book: ${error.message}`)
    }

    return data[0] as Book
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
      .select(
        "id, title, author, description, cover_url, views, category, pages, is_published, created_at, updated_at, purchase_link, tags, sales_count, external_link",
      )

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Failed to update book: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("Book not found")
    }

    return data[0] as Book
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

// Increment book views
export async function incrementBookViews(id: string) {
  try {
    const { error } = await supabase.rpc("increment_book_views", { book_id: id })

    if (error) {
      console.error("Error incrementing views:", error)
      // Don't throw error for view counting failures
    }
  } catch (error) {
    console.error("Error incrementing book views:", error)
    // Don't throw error for view counting failures
  }
}

// Get books with similar tags
export async function getBooksByTags(tags: string[], excludeId?: string, limit = 6) {
  try {
    if (!tags || tags.length === 0) {
      return []
    }

    let query = supabase
      .from("books")
      .select(
        "id, title, author, description, cover_url, views, category, pages, purchase_link, tags, is_published, created_at, updated_at, sales_count, external_link",
      )
      .eq("is_published", true)
      .overlaps("tags", tags)
      .order("views", { ascending: false })
      .limit(limit)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      throw new Error(`Database error: ${error.message}`)
    }

    return data as Book[]
  } catch (error) {
    console.error("Error fetching books by tags:", error)
    return []
  }
}

// incrementBookSales 함수 추가
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
