import { supabase } from "@/lib/supabase/client"

export interface BoardPost {
  id: string
  title: string
  content: string
  category: string
  type: "free" | "assignment"
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

// 자유게시판 게시글 가져오기
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

// 과제게시판 게시글 가져오기 (권한 체크 포함)
export async function getAssignmentPosts(userRole: string, userClassLevel?: string, limit = 20) {
  try {
    let query = supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("type", "assignment")
      .order("created_at", { ascending: false })
      .limit(limit)

    // 권한에 따른 필터링
    if (userRole === "user" && userClassLevel) {
      // 학생은 자신의 반만 볼 수 있음
      query = query.eq("category", userClassLevel)
    } else if (userRole === "instructor" && userClassLevel) {
      // 강사도 자신의 담당 반만 볼 수 있음
      query = query.eq("category", userClassLevel)
    }
    // 관리자는 모든 과제를 볼 수 있음

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
    console.error("Error fetching assignment posts:", error)
    return []
  }
}

// 게시글 상세 가져오기
export async function getBoardPost(id: string) {
  try {
    const { data, error } = await supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

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

// 댓글 가져오기
export async function getBoardComments(postId: string) {
  try {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })

    if (error) throw error

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

// 게시글 좋아요 토글
export async function togglePostLike(postId: string, userId: string) {
  try {
    // 현재 좋아요 상태 확인
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // 좋아요 취소
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)

      // 게시글 좋아요 수 감소
      await supabase.rpc("decrement_post_likes", { post_id: postId })
    } else {
      // 좋아요 추가
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId })

      // 게시글 좋아요 수 증가
      await supabase.rpc("increment_post_likes", { post_id: postId })
    }

    return !existingLike
  } catch (error) {
    console.error("Error toggling like:", error)
    return false
  }
}

// 댓글 작성
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

    // 댓글 수 증가
    await supabase.rpc("increment_post_comments", { post_id: postId })

    return data
  } catch (error) {
    console.error("Error creating comment:", error)
    return null
  }
}

// 댓글 삭제
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

// 댓글 좋아요 토글
export async function toggleCommentLike(commentId: string, userId: string) {
  try {
    // 현재 좋아요 상태 확인
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("id")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // 좋아요 취소
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId)

      return false
    } else {
      // 좋아요 추가
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId })

      return true
    }
  } catch (error) {
    console.error("Error toggling comment like:", error)
    return false
  }
}
