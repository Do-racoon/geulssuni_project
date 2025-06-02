import { supabase } from "@/lib/supabase/client"

export interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  price?: number
  is_published?: boolean
  created_at?: string
  updated_at?: string
  author_id?: string
  // DB 실제 필드명
  purchase_url?: string
  contact_url?: string
  // 클라이언트 호환성을 위한 별칭
  purchase_link?: string
  external_link?: string
  views?: number
  category?: string
  pages?: number
  tags?: string[]
  sales_count?: number
  content?: string
}

// 모든 책 가져오기
export async function getBooks(): Promise<Book[]> {
  try {
    console.log("getBooks: Fetching all books...")
    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("getBooks: Error fetching books:", error)
      throw error
    }

    // 필드명 변환
    const transformedData =
      data?.map((book) => ({
        ...book,
        purchase_link: book.purchase_url,
        external_link: book.contact_url,
      })) || []

    console.log("getBooks: Successfully fetched", transformedData.length, "books")
    return transformedData
  } catch (error) {
    console.error("getBooks: Failed to fetch books:", error)
    return []
  }
}

// ID로 책 가져오기 (기존 함수명 유지)
export async function getBook(id: string): Promise<Book | null> {
  try {
    console.log("getBook: Fetching book with ID:", id)
    const { data, error } = await supabase.from("books").select("*").eq("id", id).single()

    if (error) {
      console.error("getBook: Error fetching book:", error)
      throw error
    }

    // 필드명 변환
    const transformedData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    console.log("getBook: Successfully fetched book:", transformedData.title)
    return transformedData
  } catch (error) {
    console.error("getBook: Failed to fetch book:", error)
    return null
  }
}

// 조회수 증가
export async function incrementBookViews(id: string): Promise<void> {
  try {
    console.log("incrementBookViews: Incrementing views for book ID:", id)

    // 현재 조회수를 가져온 후 1 증가
    const { data: book, error: fetchError } = await supabase.from("books").select("views").eq("id", id).single()

    if (fetchError) {
      console.error("incrementBookViews: Error fetching current views:", fetchError)
      return
    }

    const { error: updateError } = await supabase
      .from("books")
      .update({ views: (book.views || 0) + 1 })
      .eq("id", id)

    if (updateError) {
      console.error("incrementBookViews: Error updating views:", updateError)
      return
    }

    console.log("incrementBookViews: Successfully incremented views")
  } catch (error) {
    console.error("incrementBookViews: Error incrementing views:", error)
  }
}

// 태그로 책 검색 (excludeId와 limit 파라미터 포함)
export async function getBooksByTags(tags: string[], excludeId?: string, limit = 6): Promise<Book[]> {
  try {
    console.log("getBooksByTags: Fetching books with tags:", tags, "excluding:", excludeId)

    if (!tags || tags.length === 0) {
      return []
    }

    let query = supabase.from("books").select("*").overlaps("tags", tags).eq("is_published", true).limit(limit)

    if (excludeId) {
      query = query.neq("id", excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error("getBooksByTags: Error fetching books by tags:", error)
      throw error
    }

    // 필드명 변환
    const transformedData =
      data?.map((book) => ({
        ...book,
        purchase_link: book.purchase_url,
        external_link: book.contact_url,
      })) || []

    console.log("getBooksByTags: Successfully fetched", transformedData.length, "books")
    return transformedData
  } catch (error) {
    console.error("getBooksByTags: Failed to fetch books by tags:", error)
    return []
  }
}

// 인기 책 가져오기
export async function getFeaturedBooks(): Promise<Book[]> {
  try {
    console.log("getFeaturedBooks: Fetching featured books...")
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("is_published", true)
      .order("views", { ascending: false })
      .limit(6)

    if (error) {
      console.error("getFeaturedBooks: Error fetching featured books:", error)
      throw error
    }

    // 필드명 변환
    const transformedData =
      data?.map((book) => ({
        ...book,
        purchase_link: book.purchase_url,
        external_link: book.contact_url,
      })) || []

    console.log("getFeaturedBooks: Successfully fetched", transformedData.length, "featured books")
    return transformedData
  } catch (error) {
    console.error("getFeaturedBooks: Failed to fetch featured books:", error)
    return []
  }
}

// 책 생성
export async function createBook(book: Omit<Book, "id" | "created_at" | "updated_at">): Promise<Book | null> {
  try {
    console.log("createBook: Creating book with data:", book)

    // 필드명 변환 (클라이언트 -> DB)
    const dbData = {
      ...book,
      purchase_url: book.purchase_link,
      contact_url: book.external_link,
      views: 0,
      sales_count: 0,
    }

    // 클라이언트 전용 필드 제거
    delete dbData.purchase_link
    delete dbData.external_link

    const { data, error } = await supabase.from("books").insert([dbData]).select().single()

    if (error) {
      console.error("createBook: Error creating book:", error)
      throw error
    }

    // 응답 시 필드명 변환
    const transformedData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    console.log("createBook: Successfully created book:", transformedData.title)
    return transformedData
  } catch (error) {
    console.error("createBook: Failed to create book:", error)
    return null
  }
}

// 책 업데이트
export async function updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
  try {
    console.log("updateBook: Updating book with ID:", id, "Data:", updates)

    // 필드명 변환 (클라이언트 -> DB)
    const dbUpdates = {
      ...updates,
      purchase_url: updates.purchase_link,
      contact_url: updates.external_link,
    }

    // 클라이언트 전용 필드 제거
    delete dbUpdates.purchase_link
    delete dbUpdates.external_link

    const { data, error } = await supabase.from("books").update(dbUpdates).eq("id", id).select().single()

    if (error) {
      console.error("updateBook: Error updating book:", error)
      throw error
    }

    // 응답 시 필드명 변환
    const transformedData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    console.log("updateBook: Successfully updated book:", transformedData.title)
    return transformedData
  } catch (error) {
    console.error("updateBook: Failed to update book:", error)
    return null
  }
}

// 책 삭제
export async function deleteBook(id: string): Promise<boolean> {
  try {
    console.log("deleteBook: Deleting book with ID:", id)

    const { error } = await supabase.from("books").delete().eq("id", id)

    if (error) {
      console.error("deleteBook: Error deleting book:", error)
      throw error
    }

    console.log("deleteBook: Successfully deleted book")
    return true
  } catch (error) {
    console.error("deleteBook: Failed to delete book:", error)
    return false
  }
}

// 별칭 함수들 (기존 코드와의 호환성을 위해)
export const getBookById = getBook
export const getAllBooks = getBooks
