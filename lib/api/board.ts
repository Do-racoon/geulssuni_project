import { createClient } from "@supabase/supabase-js"

// Supabase 클라이언트 생성
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface BoardPost {
  id: string
  title: string
  content: string
  category: string
  type: string
  created_at: string
  updated_at: string
  author_id: string
  likes: number
  views: number
  comments_count: number
  image_url?: string
  is_pinned?: boolean
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

export interface BoardComment {
  id: string
  content: string
  created_at: string
  author_id: string
  post_id: string
  likes: number
  isLiked?: boolean
  author?: {
    id: string
    name: string
    avatar?: string
  }
}

// 자유게시판 게시글 가져오기
export async function getFreeBoardPosts(category = "all"): Promise<BoardPost[]> {
  try {
    let query = supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq("type", "free")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (category !== "all") {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching board posts:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getFreeBoardPosts:", error)
    return []
  }
}

// 게시글 좋아요 토글
export async function togglePostLike(postId: string, userId: string): Promise<boolean> {
  try {
    // 좋아요 상태 확인
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // 좋아요 취소
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId)

      // 게시글의 좋아요 수 감소
      await supabase.rpc("decrement_post_likes", { post_id: postId })

      return false
    } else {
      // 좋아요 추가
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId })

      // 게시글의 좋아요 수 증가
      await supabase.rpc("increment_post_likes", { post_id: postId })

      return true
    }
  } catch (error) {
    console.error("Error toggling post like:", error)
    throw error
  }
}

// 댓글 생성
export async function createComment(postId: string, content: string, userId: string): Promise<BoardComment | null> {
  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        content,
        author_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating comment:", error)
      return null
    }

    // 게시글의 댓글 수 증가
    await supabase.rpc("increment_post_comments", { post_id: postId })

    return data
  } catch (error) {
    console.error("Error in createComment:", error)
    return null
  }
}

// 댓글 삭제
export async function deleteComment(commentId: string): Promise<boolean> {
  try {
    // 댓글 정보 가져오기 (게시글 ID 필요)
    const { data: comment, error: fetchError } = await supabase
      .from("comments")
      .select("post_id")
      .eq("id", commentId)
      .single()

    if (fetchError) {
      console.error("Error fetching comment:", fetchError)
      return false
    }

    // 댓글 삭제
    const { error } = await supabase.from("comments").delete().eq("id", commentId)

    if (error) {
      console.error("Error deleting comment:", error)
      return false
    }

    // 게시글의 댓글 수 감소
    if (comment?.post_id) {
      await supabase.rpc("decrement_post_comments", { post_id: comment.post_id })
    }

    return true
  } catch (error) {
    console.error("Error in deleteComment:", error)
    return false
  }
}

// 댓글 좋아요 토글
export async function toggleCommentLike(commentId: string, userId: string): Promise<boolean> {
  try {
    // 좋아요 상태 확인
    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .single()

    if (existingLike) {
      // 좋아요 취소
      await supabase.from("comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId)

      // 댓글의 좋아요 수 감소
      await supabase.rpc("decrement_comment_likes", { comment_id: commentId })

      return false
    } else {
      // 좋아요 추가
      await supabase.from("comment_likes").insert({ comment_id: commentId, user_id: userId })

      // 댓글의 좋아요 수 증가
      await supabase.rpc("increment_comment_likes", { comment_id: commentId })

      return true
    }
  } catch (error) {
    console.error("Error toggling comment like:", error)
    throw error
  }
}

// 댓글 가져오기 (페이지네이션 포함)
export async function getComments(postId: string, page = 1, perPage = 10) {
  try {
    // 총 댓글 수 가져오기
    const { count, error: countError } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("post_id", postId)

    if (countError) {
      console.error("Error counting comments:", countError)
      return { comments: [], totalPages: 1 }
    }

    // 페이지네이션 계산
    const totalPages = Math.ceil((count || 0) / perPage)
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // 댓글 가져오기
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .range(from, to)

    if (error) {
      console.error("Error fetching comments:", error)
      return { comments: [], totalPages: 1 }
    }

    return { comments: data || [], totalPages }
  } catch (error) {
    console.error("Error in getComments:", error)
    return { comments: [], totalPages: 1 }
  }
}
