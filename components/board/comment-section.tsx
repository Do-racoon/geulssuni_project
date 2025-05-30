"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { MessageCircle, Send, Heart, Trash2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createComment, deleteComment, toggleCommentLike, getComments, type BoardComment } from "@/lib/api/board"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface CommentSectionProps {
  postId: string
  initialComments: BoardComment[]
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const { user, isAdmin } = useAuth()
  const router = useRouter()
  const [comments, setComments] = useState<BoardComment[]>(initialComments)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null)
  const [likingCommentId, setLikingCommentId] = useState<string | null>(null)
  const [adminMode, setAdminMode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const commentsPerPage = 10

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isAdmin()
        setAdminMode(adminStatus)
      }
    }
    checkAdminStatus()
    loadComments(1)
  }, [user, isAdmin, postId])

  const loadComments = async (page: number) => {
    setIsLoading(true)
    try {
      const { comments: fetchedComments, totalPages: pages } = await getComments(postId, page, commentsPerPage)
      setComments(fetchedComments)
      setTotalPages(pages)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim() || isSubmitting) return

    if (!user) {
      alert("댓글을 작성하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    setIsSubmitting(true)

    try {
      const comment = await createComment(postId, newComment.trim(), user.id)

      if (comment) {
        const newCommentWithAuthor = {
          ...comment,
          author: {
            name: user.name || "현재 사용자",
            avatar: `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(user.name || "user")}`,
          },
          likes: 0,
          isLiked: false,
        }

        setComments([...comments, newCommentWithAuthor])
        setNewComment("")

        // 새 댓글이 추가되면 마지막 페이지로 이동
        loadComments(totalPages)
      }
    } catch (error) {
      console.error("Error creating comment:", error)
      alert("댓글 작성에 실패했습니다.")
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

        // 현재 페이지에 댓글이 없으면 이전 페이지로 이동
        if (comments.length === 1 && currentPage > 1) {
          loadComments(currentPage - 1)
        } else {
          loadComments(currentPage)
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error)
      alert("댓글 삭제에 실패했습니다.")
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleToggleLike = async (commentId: string) => {
    if (!user) {
      alert("좋아요를 누르려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    setLikingCommentId(commentId)

    try {
      const isLiked = await toggleCommentLike(commentId, user.id)

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
    return adminMode || comment.author_id === user?.id
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
          placeholder={user ? "댓글을 작성해주세요..." : "댓글을 작성하려면 로그인이 필요합니다."}
          className="min-h-[100px] resize-none"
          disabled={!user}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!newComment.trim() || isSubmitting || !user} className="flex items-center">
            <Send className="h-4 w-4 mr-2" />
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </Button>
        </div>
      </form>

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-500">댓글을 불러오는 중...</p>
          </div>
        ) : comments.length > 0 ? (
          <>
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-100 pl-4">
                <div className="flex items-start space-x-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={
                        comment.author?.avatar ||
                        `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(comment.author?.name || "user")}`
                      }
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

                      {canDeleteComment(comment) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="border border-black rounded-none">
                            <DropdownMenuItem
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="text-red-600 focus:text-red-600 tracking-wider font-light"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deletingCommentId === comment.id ? "DELETING..." : "DELETE"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed mb-2">{comment.content}</p>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        disabled={likingCommentId === comment.id || !user}
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
            ))}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadComments(currentPage - 1)}
                  disabled={currentPage === 1 || isLoading}
                  className="border-black"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadComments(currentPage + 1)}
                  disabled={currentPage === totalPages || isLoading}
                  className="border-black"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
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
