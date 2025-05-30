"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2, MoreVertical, Share2, Flag, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { togglePostLike, type BoardPost } from "@/lib/api/board"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

interface PostActionsProps {
  post: BoardPost
}

export default function PostActions({ post }: PostActionsProps) {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
          // 관리자 권한 확인
          setIsAdmin(currentUser.role === "admin")

          // 좋아요 상태 확인
          await checkLikeStatus(currentUser.id)

          // 북마크 상태 확인
          await checkBookmarkStatus(currentUser.id)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [post.id])

  const checkLikeStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/board-posts/${post.id}/like-status?userId=${userId}`)
      if (response.ok) {
        const { isLiked } = await response.json()
        setIsLiked(isLiked)
      }
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }

  const checkBookmarkStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/check?postId=${post.id}&userId=${userId}`)
      if (response.ok) {
        const { isBookmarked } = await response.json()
        setIsBookmarked(isBookmarked)
      }
    } catch (error) {
      console.error("Error checking bookmark status:", error)
      // 북마크 기능은 선택사항이므로 오류가 발생해도 계속 진행
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error("좋아요를 누르려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    setIsLiking(true)
    try {
      const liked = await togglePostLike(post.id, user.id)
      setIsLiked(liked)
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1))
      toast.success(liked ? "좋아요를 눌렀습니다." : "좋아요를 취소했습니다.")
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("좋아요 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLiking(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    setIsDeleting(true)
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
      console.error("Delete error:", error)
      toast.error(error instanceof Error ? error.message : "게시글 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleShare = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(window.location.href)
        toast.success("URL이 클립보드에 복사되었습니다.")
      } else {
        // Fallback for older browsers or non-secure contexts
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
          toast.success("URL이 클립보드에 복사되었습니다.")
        } catch (err) {
          toast.error("URL 복사에 실패했습니다. 수동으로 복사해주세요.")
          console.error("Fallback copy failed:", err)
        } finally {
          document.body.removeChild(textArea)
        }
      }
    } catch (error) {
      console.error("Error copying URL:", error)
      toast.error("URL 복사에 실패했습니다.")
    }
  }

  const handleReport = async () => {
    if (!user) {
      toast.error("신고하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    const reason = prompt("신고 사유를 입력해주세요:")
    if (!reason) return

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
      console.error("Error reporting post:", error)
      toast.error("신고 처리 중 오류가 발생했습니다.")
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      toast.error("북마크하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    try {
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          userId: user.id,
          action: isBookmarked ? "remove" : "add",
        }),
      })

      if (response.ok) {
        setIsBookmarked(!isBookmarked)
        toast.success(isBookmarked ? "북마크가 해제되었습니다." : "북마크에 추가되었습니다.")
      } else {
        toast.error("북마크 처리에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error bookmarking post:", error)
      toast.error("북마크 처리 중 오류가 발생했습니다.")
    }
  }

  const canDeletePost = isAdmin || post.author_id === user?.id

  if (isLoading) {
    return (
      <div className="flex items-center justify-between border-t border-b border-black py-4 mb-8">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-none"></div>
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-none"></div>
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-none"></div>
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
          onClick={handleBookmark}
          variant="outline"
          size="sm"
          className={`flex items-center border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none ${
            isBookmarked ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? "fill-current" : ""}`} />
          BOOKMARK
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
}
