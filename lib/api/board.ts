import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase/client"
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

// 자유게시판 게시글 가져오기 (클라이언트용)
export async function getFreeBoardPosts(category = "all", limit = 20) {
  try {
    let query = supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("type", "free")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit)

    if (category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map((post) => ({
      ...post,
      author: {
        name: post.author?.name || "Anonymous",
        avatar: `/placeholder.svg?height=32&width=32&query=${post.author?.name || "user"}`,
      },
    }))
  } catch (error) {
    console.error("Error fetching free board posts:", error)
    return []
  }
}

// 과제게시판 게시글 가져오기 (클라이언트용)
export async function getAssignmentPosts(userRole: string, userClassLevel?: string, limit = 20) {
  try {
    console.log("🔍 getAssignmentPosts 호출됨:", { userRole, userClassLevel, limit })

    let query = supabase
      .from("board_posts")
      .select(`
        *,
        assignments(*),
        author:users!author_id(name, email)
      `)
      .in("type", ["assignment", "qna"])
      .order("created_at", { ascending: false })
      .limit(limit)

    // 권한에 따른 필터링
    if (userRole === "user" && userClassLevel) {
      query = query.eq("category", userClassLevel)
    } else if (userRole === "instructor" && userClassLevel) {
      query = query.eq("category", userClassLevel)
    }

    const { data, error } = await query

    if (error) {
      console.error("🔴 과제 조회 오류:", error)
      throw error
    }

    console.log("✅ 과제 조회 결과:", data?.length || 0, "개")

    return data.map((post) => {
      const passwordMatch = post.content.match(/🔒 PASSWORD:(.+)/)
      const password = passwordMatch ? passwordMatch[1].trim() : null
      const cleanContent = post.content.replace(/\n\n🔒 PASSWORD:.+$/, "")

      return {
        ...post,
        content: cleanContent,
        password,
        author: {
          name: post.author?.name || "Anonymous",
          avatar: `/placeholder.svg?height=32&width=32&query=${post.author?.name || "user"}`,
        },
      }
    })
  } catch (error) {
    console.error("Error fetching assignment posts:", error)
    return []
  }
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

// 게시글 좋아요 토글 (클라이언트용)
export async function togglePostLike(postId: string, userId: string) {
  try {
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)
      await supabase.rpc("decrement_post_likes", { post_id: postId })
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId })
      await supabase.rpc("increment_post_likes", { post_id: postId })
    }

    return !existingLike
  } catch (error) {
    console.error("Error toggling like:", error)
    return false
  }
}

// 댓글 작성 (클라이언트용)
export async function createComment(postId: string, content: string, authorId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content,
        author_id: authorId,
      })
      .select()
      .single()

    if (error) throw error

    await supabase.rpc("increment_post_comments", { post_id: postId })

    return data
  } catch (error) {
    console.error("Error creating comment:", error)
    return null
  }
}

// 댓글 삭제 (클라이언트용)
export async function deleteComment(commentId: string) {
  try {
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) throw error

    return true
  } catch (error) {
    console.error("Error deleting comment:", error)
    return false
  }
}

// 댓글 좋아요 토글 (클라이언트용)
export async function toggleCommentLike(commentId: string, userId: string) {
  try {
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId)
      return false
    } else {
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId })
      return true
    }
  } catch (error) {
    console.error("Error toggling comment like:", error)
    return false
  }
}
