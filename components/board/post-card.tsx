"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Heart, MessageCircle, Pin, Trash2, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { BoardPost } from "@/lib/api/board"

interface PostCardProps {
  post: BoardPost
  onLike: (postId: string) => void
  isAdmin?: boolean
  onDelete?: (postId: string) => void
  onTogglePin?: (postId: string) => void
}

// HTML 태그 제거 및 텍스트만 추출하는 함수
const cleanContent = (content: string) => {
  if (!content) return ""

  // HTML 태그 모두 제거
  let cleanText = content.replace(/<[^>]*>/g, "")

  // 연속된 공백과 줄바꿈 정리
  cleanText = cleanText.replace(/\s+/g, " ").trim()

  // 이미지가 있었던 자리는 [이미지] 표시
  if (content.includes("<img")) {
    cleanText = cleanText + " [이미지 포함]"
  }

  return cleanText
}

export default function PostCard({ post, onLike, isAdmin = false, onDelete, onTogglePin }: PostCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formattedDate = new Date(post.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const getCategoryLabel = (category: string, type: string) => {
    if (type === "free") {
      switch (category) {
        case "general":
          return "FREE"
        case "sharing":
          return "SHARE"
        case "open":
          return "QUESTION"
        case "tech":
          return "TECH"
        case "design":
          return "DESIGN"
        default:
          return category.toUpperCase()
      }
    }
    return category.toUpperCase()
  }

  const getCategoryColor = (category: string, type: string) => {
    if (type === "free") {
      switch (category) {
        case "general":
          return "bg-white text-black border border-black"
        case "sharing":
          return "bg-white text-black border border-black"
        case "open":
          return "bg-white text-black border border-black"
        case "tech":
          return "bg-white text-black border border-black"
        case "design":
          return "bg-white text-black border border-black"
        default:
          return "bg-white text-black border border-black"
      }
    }
    return "bg-white text-black border border-black"
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

      if (response.ok) {
        onDelete?.(post.id)
      } else {
        alert("게시글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("게시글 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleTogglePin = async () => {
    try {
      const response = await fetch(`/api/board-posts/${post.id}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned: !post.is_pinned }),
      })

      if (response.ok) {
        onTogglePin?.(post.id)
      } else {
        alert("게시글 고정 상태 변경에 실패했습니다.")
      }
    } catch (error) {
      console.error("Pin toggle error:", error)
      alert("게시글 고정 상태 변경 중 오류가 발생했습니다.")
    }
  }

  // 사용자 이름으로 아바타 이미지 생성
  const getAvatarUrl = (name: string) => {
    return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(name || "user")}`
  }

  return (
    <div className="border border-black bg-white hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {post.is_pinned && (
                <span className="mr-2 text-black">
                  <Pin className="h-4 w-4" />
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 ${getCategoryColor(post.category, post.type)} tracking-wider font-light`}
              >
                {getCategoryLabel(post.category, post.type)}
              </span>
            </div>
            <Link href={`/board/${post.id}`} className="block">
              <h3 className="text-xl font-light tracking-wider hover:underline">{post.title}</h3>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 tracking-wider">{formattedDate}</div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="border border-black">
                  <DropdownMenuItem onClick={handleTogglePin} className="tracking-wider font-light">
                    <Pin className="h-4 w-4 mr-2" />
                    {post.is_pinned ? "UNPIN" : "PIN"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="text-red-600 tracking-wider font-light"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "DELETING..." : "DELETE"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Link href={`/board/${post.id}`} className="block">
          <div className="mb-4">
            <p className="text-gray-700 line-clamp-3 font-light">{cleanContent(post.content)}</p>
          </div>

          {post.image_url && (
            <div className="mb-4">
              <div className="relative h-48 w-full">
                <Image src={post.image_url || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          )}
        </Link>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-8 h-8 overflow-hidden mr-2">
              <Image src={getAvatarUrl(post.author?.name || "Anonymous")} alt={post.author?.name || "Author"} fill />
            </div>
            <span className="text-sm tracking-wider font-light">{post.author?.name}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike(post.id)
              }}
              className={`flex items-center text-sm ${post.isLiked ? "text-black" : "text-gray-500"} hover:text-black transition-colors`}
              aria-label={post.isLiked ? "좋아요 취소" : "좋아요"}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-black" : ""}`} />
              <span className="tracking-wider font-light">{post.likes}</span>
            </button>
            <div className="flex items-center text-sm text-gray-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span className="tracking-wider font-light">{post.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
