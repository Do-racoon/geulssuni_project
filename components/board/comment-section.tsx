"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { MessageCircle, Send, Heart, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createComment, deleteComment, toggleCommentLike, type BoardComment } from "@/lib/api/board"

interface CommentSectionProps {
  postId: string
  initialComments: BoardComment[]
  currentUserId?: string
  isAdmin?: boolean
}

export default function CommentSection({
  postId,
  initialComments,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const [comments, setComments] = useState<BoardComment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)

    try {
      // 임시 사용자 ID (실제로는 로그인된 사용자 ID 사용)
      const userId = currentUserId || "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f"

      const comment = await createComment(postId, newComment.trim(), userId)

      if (comment) {
        // 새 댓글을 목록에 추가
        const newCommentWithAuthor = {
          ...comment,
          author: {
            name: "이학생", // 임시 이름
            avatar: "/placeholder.svg?height=32&width=32&query=user",
          },
          likes: 0,
          isLiked: false,
        }

        setComments([...comments, newCommentWithAuthor])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error creating comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return

    setDeletingCommentId(commentId)

    try {
      const success = await deleteComment(commentId)
      if (success) {
        setComments(comments.filter((comment) => comment.id !== commentId))
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleToggleLike = async (commentId: string) => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.")
      return
    }

    setLikingCommentId(commentId)

    try {
      const isLiked = await toggleCommentLike(commentId, currentUserId)

      setComments(
        comments.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: isLiked ? (comment.likes || 0) + 1 : Math.max(0, (comment.likes || 0) - 1),
              isLiked,
            }
          }
          return comment
        }),
      )
    } catch (error) {
      console.error("Error toggling like:", error)
    } finally {
      setLikingCommentId(null)
    }
  }

  const canDeleteComment = (comment: BoardComment) => {
    return isAdmin || comment.author_id === currentUserId
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-5 w-5 mr-2" />
        <h3 className="text-lg font-medium">댓글 {comments.length}개</h3>
      </div>

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmitComment} className="space-y-4">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글을 작성해주세요..."
          className="min-h-[100px] resize-none"
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!newComment.trim() || isSubmitting} className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-2 border-gray-100 pl-4">
              <div className="flex items-start space-x-3">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.author?.avatar || "/placeholder.svg?height=32&width=32"}
                    alt={comment.author?.name || "User"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.author?.name}</span>
                      <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                    </div>

                    {/* 댓글 메뉴 */}
                    {canDeleteComment(comment) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deletingCommentId === comment.id}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deletingCommentId === comment.id ? "삭제 중..." : "삭제"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <p className="text-gray-700 leading-relaxed mb-2">{comment.content}</p>

                  {/* 댓글 좋아요 */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleLike(comment.id)}
                      disabled={likingCommentId === comment.id || !currentUserId}
                      className={`flex items-center space-x-1 text-sm transition-colors ${
                        comment.isLiked ? "text-red-500 hover:text-red-600" : "text-gray-500 hover:text-red-500"
                      } disabled:opacity-50`}
                    >
                      <Heart className={`h-4 w-4 ${comment.isLiked ? "fill-current" : ""}`} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>아직 댓글이 없습니다.</p>
            <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
          </div>
        )}
      </div>
    </div>
  )
}
