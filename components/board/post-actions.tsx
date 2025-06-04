"use client"

import { useState, useEffect, useCallback, memo } from "react"
import { Heart, Trash2, MoreVertical, Share2, Flag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PostActionsProps {
  post: {
    id: string
    likes?: number
    author_id?: string
    title?: string
  }
}

const PostActions = memo(function PostActions({ post }: PostActionsProps) {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const router = useRouter()

  console.log(`[PostActions] Component rendered for post: ${post.id}`)

  // 사용자 데이터 로드 함수
  const loadUserData = useCallback(async () => {
    if (hasInitialized) {
      console.log(`[PostActions] Already initialized for post: ${post.id}`)
      return
    }

    console.log(`[PostActions] Loading user data for post: ${post.id}`)
    setIsLoading(true)

    try {
      const supabase = getSupabaseClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log(`[PostActions] Session check:`, {
        hasSession: !!session,
        userId: session?.user?.id,
        error: sessionError?.message,
      })

      if (!session || !session.user) {
        console.log(`[PostActions] No session found`)
        setUser(null)
        setHasInitialized(true)
        setIsLoading(false)
        return
      }

      // 사용자 프로필 조회
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, role, class_level, is_active")
        .eq("id", session.user.id)
        .single()

      console.log(`[PostActions] User profile:`, {
        found: !!userProfile,
        role: userProfile?.role,
        error: profileError?.message,
      })

      if (profileError || !userProfile || !userProfile.is_active) {
        console.log(`[PostActions] Profile issue`)
        setUser(null)
        setHasInitialized(true)
        setIsLoading(false)
        return
      }

      const userData = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        class_level: userProfile.class_level,
      }

      setUser(userData)
      setIsAdmin(userProfile.role === "admin")

      console.log(`[PostActions] User authenticated:`, userData)

      // 좋아요 상태 확인
      if (userData.id) {
        await checkLikeStatus(userData.id)
      }
    } catch (error) {
      console.error(`[PostActions] Error loading user data:`, error)
      setUser(null)
    } finally {
      setHasInitialized(true)
      setIsLoading(false)
    }
  }, [post.id, hasInitialized])

  // 좋아요 상태 확인
  const checkLikeStatus = useCallback(
    async (userId: string) => {
      try {
        console.log(`[PostActions] Checking like status for post: ${post.id}, user: ${userId}`)
        const response = await fetch(`/api/board-posts/${post.id}/like-status?userId=${userId}`)
        if (response.ok) {
          const { isLiked } = await response.json()
          console.log(`[PostActions] Like status: ${isLiked}`)
          setIsLiked(isLiked)
        }
      } catch (error) {
        console.error(`[PostActions] Error checking like status:`, error)
      }
    },
    [post.id],
  )

  // 좋아요 토글
  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("좋아요를 누르려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    if (isLiking) {
      console.log(`[PostActions] Like action already in progress`)
      return
    }

    setIsLiking(true)
    console.log(`[PostActions] Toggling like for post: ${post.id}`)

    try {
      const response = await fetch(`/api/board-posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[PostActions] Like toggle response:`, data)
        setIsLiked(data.isLiked)
        setLikeCount(data.likesCount)
        toast.success(data.isLiked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.")
      } else {
        console.error(`[PostActions] Failed to toggle like:`, response.status)
        toast.error("좋아요 처리 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error(`[PostActions] Error toggling like:`, error)
      toast.error("좋아요 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLiking(false)
    }
  }, [user, post.id, isLiking, router])

  // 게시글 삭제
  const handleDelete = useCallback(async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    setIsDeleting(true)
    console.log(`[PostActions] Deleting post: ${post.id}`)

    try {
      const response = await fetch(`/api/board-posts/${post.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "게시글 삭제에 실패했습니다.")
      }

      toast.success("게시글이 삭제되었습니다.")
      router.push("/board")
    } catch (error) {
      console.error(`[PostActions] Delete error:`, error)
      toast.error(error instanceof Error ? error.message : "게시글 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }, [post.id, router])

  // 공유 기능
  const handleShare = useCallback(async () => {
    console.log(`[PostActions] Sharing post: ${post.id}`)

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("링크가 복사되었습니다!")
      } else {
        // Fallback for older browsers
        const textArea = document.createElement("textarea")
        textArea.value = window.location.href
        textArea.style.position = "fixed"
        textArea.style.left = "-999999px"
        textArea.style.top = "-999999px"
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()

        try {
          document.execCommand("copy")
          toast.success("링크가 복사되었습니다!")
        } catch (err) {
          toast.error("링크 복사에 실패했습니다.")
          console.error(`[PostActions] Fallback copy failed:`, err)
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error(`[PostActions] Error copying URL:`, error)
      toast.error("링크 복사에 실패했습니다.")
    }
  }, [post.id])

  // 신고 기능
  const handleReport = useCallback(async () => {
    if (!user) {
      toast.error("신고하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    const reason = prompt("신고 사유를 입력해주세요:")
    if (!reason) return

    console.log(`[PostActions] Reporting post: ${post.id}`)

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          userId: user.id,
          reason,
        }),
      })

      if (response.ok) {
        toast.success("신고가 접수되었습니다.")
      } else {
        toast.error("신고 접수에 실패했습니다.")
      }
    } catch (error) {
      console.error(`[PostActions] Error reporting post:`, error)
      toast.error("신고 처리 중 오류가 발생했습니다.")
    }
  }, [user, post.id, router])

  // 컴포넌트 마운트 시 사용자 데이터 로드
  useEffect(() => {
    console.log(`[PostActions] useEffect triggered for post: ${post.id}, initialized: ${hasInitialized}`)
    loadUserData()
  }, [loadUserData])

  // post.likes 변경 시 likeCount 업데이트
  useEffect(() => {
    if (post.likes !== likeCount) {
      console.log(`[PostActions] Updating like count from ${likeCount} to ${post.likes}`)
      setLikeCount(post.likes || 0)
    }
  }, [post.likes, likeCount])

  const canDeletePost = isAdmin || post.author_id === user?.id

  if (isLoading) {
    return (
      <div className="flex items-center justify-between border-t border-b border-black py-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-none"></div>
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-none"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between border-t border-b border-black py-4 mb-8">
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleLike}
          disabled={isLiking || !user}
          variant="outline"
          size="sm"
          className={`flex items-center border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none ${
            isLiked ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiking ? "..." : `LIKE ${likeCount}`}
        </Button>

        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="flex items-center border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
        >
          <Share2 className="h-4 w-4 mr-2" />
          SHARE
        </Button>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-none">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="border border-black rounded-none">
          <DropdownMenuItem onClick={handleReport} className="tracking-wider font-light">
            <Flag className="h-4 w-4 mr-2" />
            REPORT
          </DropdownMenuItem>

          {canDeletePost && (
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600 tracking-wider font-light"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "DELETING..." : "DELETE"}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})

export default PostActions
