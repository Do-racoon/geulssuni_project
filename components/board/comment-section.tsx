"use client"

import type React from "react"
import { useState, useEffect, useCallback, memo } from "react"
import Image from "next/image"
import { MessageCircle, Send, Heart, Trash2, MoreVertical, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface BoardComment {
  id: string
  content: string
  created_at: string
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  likes?: number
  isLiked?: boolean
}

interface CommentSectionProps {
  postId: string
  initialComments: BoardComment[]
}

const CommentSection = memo(function CommentSection({ postId, initialComments }: CommentSectionProps) {
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
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const commentsPerPage = 10

  console.log(`[CommentSection] Component rendered for post: ${postId}`)

  // 사용자 정보 가져오기
  const fetchUser = useCallback(async () => {
    if (hasInitialized) {
      console.log(`[CommentSection] Already initialized for post: ${postId}`)
      return
    }

    console.log(`[CommentSection] Fetching user for post: ${postId}`)
    setUserLoading(true)

    try {
      const supabase = getSupabaseClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log(`[CommentSection] Session check:`, {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      })

      if (!session || !session.user) {
        console.log(`[CommentSection] No session found`)
        setUser(null)
        setHasInitialized(true)
        setUserLoading(false)
        return
      }

      // 사용자 프로필 조회
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, role, class_level, is_active")
        .eq("id", session.user.id)
        .single()

      console.log(`[CommentSection] User profile:`, {
        found: !!userProfile,
        profile: userProfile,
        error: profileError?.message,
      })

      if (profileError || !userProfile || !userProfile.is_active) {
        console.log(`[CommentSection] Profile issue`)
        setUser(null)
        setHasInitialized(true)
        setUserLoading(false)
        return
      }

      const userData = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        class_level: userProfile.class_level,
      }

      console.log(`[CommentSection] User authenticated:`, userData)
      setUser(userData)
      setAdminMode(userProfile.role === "admin")
    } catch (error) {
      console.error(`[CommentSection] Error fetching user:`, error)
      setUser(null)
    } finally {
      setHasInitialized(true)
      setUserLoading(false)
    }
  }, [postId, hasInitialized])

  // 댓글 로드
  const loadComments = useCallback(
    async (page: number) => {
      setIsLoading(true)
      console.log(`[CommentSection] Loading comments for post: ${postId}, page: ${page}`)

      try {
        const response = await fetch(`/api/comments?postId=${postId}&page=${page}&limit=${commentsPerPage}`)
        if (response.ok) {
          const data = await response.json()
          console.log(`[CommentSection] Loaded ${data.comments?.length || 0} comments`)
          setComments(data.comments || [])
          setTotalPages(data.totalPages || 1)
          setCurrentPage(page)
        } else {
          console.error(`[CommentSection] Failed to load comments:`, response.status)
        }
      } catch (error) {
        console.error(`[CommentSection] Error loading comments:`, error)
      } finally {
        setIsLoading(false)
      }
    },
    [postId, commentsPerPage],
  )

  // 댓글 제출
  const handleSubmitComment = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!newComment.trim() || isSubmitting) return

      if (!user) {
        toast.error("댓글을 작성하려면 로그인이 필요합니다.")
        router.push("/login")
        return
      }

      setIsSubmitting(true)
      console.log(`[CommentSection] Submitting comment for post: ${postId}`)

      try {
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
          const comment = await response.json()
          console.log(`[CommentSection] Comment submitted successfully`)

          const newCommentWithAuthor = {
            ...comment,
            author: {
              name: user.name || "현재 사용자",
              avatar: `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(user.name || "user")}`,
            },
            likes: 0,
            isLiked: false,
          }

          setNewComment("")
          toast.success("댓글이 작성되었습니다.")

          // 현재 페이지에 댓글 추가 또는 새 페이지로 이동
          if (comments.length < commentsPerPage) {
            setComments([...comments, newCommentWithAuthor])
          } else {
            const newTotalPages = totalPages + 1
            setTotalPages(newTotalPages)
            loadComments(newTotalPages)
          }
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || "댓글 작성에 실패했습니다.")
        }
      } catch (error) {
        console.error(`[CommentSection] Error creating comment:`, error)
        toast.error(error instanceof Error ? error.message : "댓글 작성에 실패했습니다.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [newComment, isSubmitting, user, postId, router, comments, commentsPerPage, totalPages, loadComments],
  )

  // 댓글 삭제
  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!confirm("댓글을 삭제하시겠습니까?")) return

      setDeletingCommentId(commentId)
      console.log(`[CommentSection] Deleting comment: ${commentId}`)

      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("댓글이 삭제되었습니다.")

          // 현재 페이지에 댓글이 하나만 있고 첫 페이지가 아니면 이전 페이지로 이동
          if (comments.length === 1 && currentPage > 1) {
            loadComments(currentPage - 1)
          } else {
            // 그렇지 않으면 현재 페이지 다시 로드
            loadComments(currentPage)
          }
        } else {
          toast.error("댓글 삭제에 실패했습니다.")
        }
      } catch (error) {
        console.error(`[CommentSection] Error deleting comment:`, error)
        toast.error("댓글 삭제에 실패했습니다.")
      } finally {
        setDeletingCommentId(null)
      }
    },
    [comments.length, currentPage, loadComments],
  )

  // 댓글 좋아요 토글
  const handleToggleLike = useCallback(
    async (commentId: string) => {
      if (!user) {
        toast.error("좋아요를 누르려면 로그인이 필요합니다.")
        router.push("/login")
        return
      }

      setLikingCommentId(commentId)
      console.log(`[CommentSection] Toggling like for comment: ${commentId}`)

      try {
        const response = await fetch(`/api/comments/${commentId}/like`, {
          method: "POST",
        })

        if (response.ok) {
          const data = await response.json()
          console.log(`[CommentSection] Comment like toggled successfully`)

          setComments(
            comments.map((comment) => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  likes: data.likesCount,
                  isLiked: data.isLiked,
                }
              }
              return comment
            }),
          )

          toast.success(data.isLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.")
        } else {
          toast.error("좋아요 처리 중 오류가 발생했습니다.")
        }
      } catch (error) {
        console.error(`[CommentSection] Error toggling like:`, error)
        toast.error("좋아요 처리 중 오류가 발생했습니다.")
      } finally {
        setLikingCommentId(null)
      }
    },
    [user, router, comments],
  )

  // 컴포넌트 마운트 시 초기화
  useEffect(() => {
    console.log(`[CommentSection] useEffect triggered for post: ${postId}, initialized: ${hasInitialized}`)
    fetchUser()
    if (!hasInitialized) {
      loadComments(1)
    }
  }, [fetchUser, loadComments, postId, hasInitialized])

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
          disabled={!user || userLoading}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!newComment.trim() || isSubmitting || !user || userLoading}
            className="flex items-center"
          >
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
})

export default CommentSection
