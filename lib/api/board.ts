import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export interface BoardPost {
  id: string
  title: string
  content: string
  category: string
  type: "free" | "assignment" | "qna"
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  image_url?: string
  is_pinned: boolean
  likes: number
  comments_count: number
  views: number
  created_at: string
  updated_at: string
}

export interface BoardComment {
  id: string
  post_id: string
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  content: string
  likes?: number
  isLiked?: boolean
  created_at: string
  updated_at: string
}

// 게시글 상세 가져오기 (서버 컴포넌트용)
export async function getBoardPost(id: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { data, error } = await supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching board post:", error)
      return null
    }

    // 조회수 증가
    await supabase
      .from("board_posts")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", id)

    return {
      ...data,
      author: {
        name: data.author?.name || "Anonymous",
        avatar: `/placeholder.svg?height=32&width=32&query=${data.author?.name || "user"}`,
      },
    }
  } catch (error) {
    console.error("Error fetching board post:", error)
    return null
  }
}

// 댓글 가져오기 (서버 컴포넌트용)
export async function getBoardComments(postId: string) {
  try {
    const supabase = createServerComponentClient({ cookies })

    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching comments:", error)
      return []
    }

    return data.map((comment) => ({
      ...comment,
      author: {
        name: comment.author?.name || "Anonymous",
        avatar: `/placeholder.svg?height=32&width=32&query=${comment.author?.name || "user"}`,
      },
    }))
  } catch (error) {
    console.error("Error fetching comments:", error)
    return []
  }
}

// 클라이언트용 함수들은 기존 그대로 유지...
// (나머지 함수들은 클라이언트 컴포넌트에서 사용)
