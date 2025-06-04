"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { MessageCircle, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { createSupabaseClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  content: string
  created_at: string
  author: {
    id: string
    name: string
  }
  likes: number
  isLiked?: boolean
}

interface CommentSectionProps {
  postId: string
  initialComments: Comment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedComments, setHasLoadedComments] = useState(false)

  console.log(`[CommentSection] Component mounted for post: ${postId}`)

  // 댓글 로드 함수를 useCallback으로 메모이제이션
  const loadComments = useCallback(async () => {
    if (hasLoadedComments) {
      console.log(`[CommentSection] Comments already loaded for post: ${postId}`)
      return
    }

    setIsLoading(true)
    console.log(`[CommentSection] Loading comments for post: ${postId}`)

    try {
      const response = await fetch(`/api/comments?postId=${postId}`)
      if (response.ok) {
        const data = await response.json()
        console.log(`[CommentSection] Loaded ${data.length} comments`)
        setComments(data)
      } else {
        console.error(`[CommentSection] Failed to load comments:`, response.status)
      }
    } catch (error) {
      console.error(`[CommentSection] Error loading comments:`, error)
    } finally {
      setIsLoading(false)
      setHasLoadedComments(true)
    }
  }, [postId, hasLoadedComments])

  // 댓글 제출 함수
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!newComment.trim() || isSubmitting) {
        return
      }

      setIsSubmitting(true)
      console.log(`[CommentSection] Submitting comment for post: ${postId}`)

      try {
        const supabase = createSupabaseClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          alert("로그인이 필요합니다.")
          return
        }

        const response = await fetch("/api/comments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId,
            content: newComment.trim(),
          }),
        })

        if (response.ok) {
          const newCommentData = await response.json()
          console.log(`[CommentSection] Comment submitted successfully`)
          setComments((prev) => [newCommentData, ...prev])
          setNewComment("")
        } else {
          console.error(`[CommentSection] Failed to submit comment:`, response.status)
          alert("댓글 작성 중 오류가 발생했습니다.")
        }
      } catch (error) {
        console.error(`[CommentSection] Error submitting comment:`, error)
        alert("댓글 작성 중 오류가 발생했습니다.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [postId, newComment, isSubmitting],
  )

  // 댓글 좋아요 토글 함수
  const handleCommentLike = useCallback(async (commentId: string) => {
    console.log(`[CommentSection] Toggling like for comment: ${commentId}`)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[CommentSection] Comment like toggled successfully`)
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, likes: data.likesCount, isLiked: data.isLiked } : comment,
          ),
        )
      } else {
        console.error(`[CommentSection] Failed to toggle comment like:`, response.status)
        alert("좋아요 처리 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error(`[CommentSection] Error toggling comment like:`, error)
      alert("좋아요 처리 중 오류가 발생했습니다.")
    }
  }, [])

  // 컴포넌트 마운트 시 댓글 로드 (한 번만)
  useEffect(() => {
    console.log(`[CommentSection] useEffect triggered for post: ${postId}, hasLoaded: ${hasLoadedComments}`)
    loadComments()
  }, [loadComments]) // loadComments는 useCallback으로 메모이제이션됨

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="border-t border-gray-200 pt-8">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-light tracking-wider">COMMENTS ({comments.length})</h3>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="mb-8">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성해주세요..."
          className="mb-4 min-h-[100px] border-black focus:border-black"
          disabled={isSubmitting}
        />
        <Button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="bg-black text-white hover:bg-gray-800 tracking-wider font-light"
        >
          <Send className="h-4 w-4 mr-2" />
          {isSubmitting ? "POSTING..." : "POST COMMENT"}
        </Button>
      </form>

      {/* 댓글 목록 */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-gray-500 tracking-wider font-light">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 tracking-wider font-light">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <div className="font-light tracking-wider">{comment.author.name}</div>
                  <div className="text-sm text-gray-500 ml-3 tracking-wider font-light">
                    {formatDate(comment.created_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCommentLike(comment.id)}
                  className={`text-sm ${comment.isLiked ? "text-red-600" : "text-gray-500"} hover:text-red-600`}
                >
                  ♥ {comment.likes || 0}
                </Button>
              </div>
              <p className="text-gray-800 leading-relaxed font-light whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
