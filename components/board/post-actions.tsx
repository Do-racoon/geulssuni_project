"use client"

import { useState, useEffect } from "react"
import { Heart, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { togglePostLike, type BoardPost } from "@/lib/api/board"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface PostActionsProps {
  post: BoardPost
  currentUserId?: string
  isAdmin?: boolean
}

export default function PostActions({ post, currentUserId, isAdmin }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  // 초기 좋아요 상태 확인
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!currentUserId) return

      try {
        const response = await fetch(`/api/board-posts/${post.id}/like-status?userId=${currentUserId}`)
        if (response.ok) {
          const { isLiked } = await response.json()
          setIsLiked(isLiked)
        }
      } catch (error) {
        console.error("Error checking like status:", error)
      }
    }

    checkLikeStatus()
  }, [post.id, currentUserId])

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("로그인이 필요합니다.")
      return
    }

    setIsLiking(true)
    try {
      const liked = await togglePostLike(post.id, currentUserId)
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
      // 직접 Supabase 클라이언트를 사용하여 삭제
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

  const canDeletePost = isAdmin || post.author_id === currentUserId

  return (
    <div className="flex items-center justify-between border-t border-b border-black py-4 mb-8">
      <div className="flex items-center space-x-4">
        <Button
          onClick={handleLike}
          disabled={isLiking || !currentUserId}
          variant="outline"
          size="sm"
          className={`flex items-center border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none ${
            isLiked ? "bg-black text-white" : "bg-white text-black"
          }`}
        >
          <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
          {isLiking ? "..." : `LIKE ${likeCount}`}
        </Button>
      </div>

      {canDeletePost && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100 rounded-none">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border border-black rounded-none">
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 focus:text-red-600 tracking-wider font-light"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDeleting ? "DELETING..." : "DELETE"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
