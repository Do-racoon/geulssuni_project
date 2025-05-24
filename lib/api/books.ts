import { supabase } from "@/lib/supabase/client"

export interface Book {
  id: string
  title: string
  author: string
  description?: string
  content?: string
  cover_image?: string
  published_date?: string
  purchase_url?: string
  category?: string
  likes: number
  created_at?: string
  updated_at?: string
}

// Get all books
export async function getBooks() {
  const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
    throw new Error("Failed to fetch books")
  }

  return data as Book[]
}

// Get a single book by ID
export async function getBook(id: string) {
  const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching book:", error)
    throw new Error("Failed to fetch book")
  }

  return data as Book
}

// Create a new book
export async function createBook(book: Omit<Book, "id" | "created_at" | "updated_at" | "likes">) {
  const { data, error } = await supabase
    .from("books")
    .insert([{ ...book, likes: 0 }])
    .select()

  if (error) {
    console.error("Error creating book:", error)
    throw new Error("Failed to create book")
  }

  return data[0] as Book
}

// Update an existing book
export async function updateBook(id: string, book: Partial<Omit<Book, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("books")
    .update({ ...book, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating book:", error)
    throw new Error("Failed to update book")
  }

  return data[0] as Book
}

// Delete a book
export async function deleteBook(id: string) {
  const { error } = await supabase.from("books").delete().eq("id", id)

  if (error) {
    console.error("Error deleting book:", error)
    throw new Error("Failed to delete book")
  }

  return true
}
