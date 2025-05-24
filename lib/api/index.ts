import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Create a Supabase client
const getClient = () => createClientComponentClient()

// Generic function to fetch data from any table
export async function fetchData(
  table: string,
  options?: {
    select?: string
    filters?: Record<string, any>
    limit?: number
    order?: { column: string; ascending?: boolean }
  },
) {
  const supabase = getClient()

  let query = supabase.from(table).select(options?.select || "*")

  // Apply filters if provided
  if (options?.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      query = query.eq(key, value)
    })
  }

  // Apply ordering if provided
  if (options?.order) {
    query = query.order(options.order.column, { ascending: options.order.ascending ?? true })
  }

  // Apply limit if provided
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error(`Error fetching data from ${table}:`, error)
    throw new Error(`Failed to fetch data from ${table}`)
  }

  return data
}

// Specific API functions for each entity
export const api = {
  // Lectures
  lectures: {
    getAll: () => fetchData("lectures"),
    getById: (id: string) => fetchData("lectures", { filters: { id } }),
    getByInstructor: (instructorId: string) => fetchData("lectures", { filters: { instructor_id: instructorId } }),
    getFeatured: () => fetchData("lectures", { filters: { is_published: true }, limit: 6 }),
  },

  // Books
  books: {
    getAll: () => fetchData("books"),
    getById: (id: string) => fetchData("books", { filters: { id } }),
    getFeatured: () => fetchData("books", { filters: { is_published: true }, limit: 6 }),
  },

  // Board Posts
  boardPosts: {
    getAll: (type?: string) =>
      fetchData("board_posts", {
        filters: type ? { type } : undefined,
        order: { column: "created_at", ascending: false },
      }),
    getById: (id: string) => fetchData("board_posts", { filters: { id } }),
    getByAuthor: (authorId: string) => fetchData("board_posts", { filters: { author_id: authorId } }),
  },

  // Comments
  comments: {
    getByPostId: (postId: string) =>
      fetchData("comments", {
        filters: { post_id: postId },
        order: { column: "created_at", ascending: true },
      }),
  },

  // FAQs
  faqs: {
    getAll: () => fetchData("faqs", { order: { column: "order_index" } }),
    getByCategory: (category: string) =>
      fetchData("faqs", {
        filters: { category },
        order: { column: "order_index" },
      }),
  },

  // Users
  users: {
    getById: (id: string) => fetchData("users", { filters: { id } }),
    getByRole: (role: string) => fetchData("users", { filters: { role } }),
  },
}
