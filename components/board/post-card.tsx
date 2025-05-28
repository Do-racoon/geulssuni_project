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
          return "일반"
        case "sharing":
          return "공유"
        case "open":
          return "자유주제"
        case "tech":
          return "기술"
        case "design":
          return "디자인"
        default:
          return category
      }
    }
    return category
  }

  const getCategoryColor = (category: string, type: string) => {
    if (type === "free") {
      switch (category) {
        case "general":
          return "bg-blue-100 text-blue-800"
        case "sharing":
          return "bg-green-100 text-green-800"
        case "open":
          return "bg-purple-100 text-purple-800"
        case "tech":
          return "bg-orange-100 text-orange-800"
        case "design":
          return "bg-pink-100 text-pink-800"
        default:
          return "bg-gray-100 text-gray-800"
      }
    }
    return "bg-gray-100 text-gray-800"
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

  return (
    <div className="border border-gray-200 bg-white hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              {post.is_pinned && (
                <span className="mr-2 text-gray-500">
                  <Pin className="h-4 w-4" />
                </span>
              )}
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(post.category, post.type)}`}>
                {getCategoryLabel(post.category, post.type)}
              </span>
            </div>
            <Link href={`/board/${post.id}`} className="block">
              <h3 className="text-xl font-light tracking-wider hover:underline">{post.title}</h3>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500">{formattedDate}</div>
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleTogglePin}>
                    <Pin className="h-4 w-4 mr-2" />
                    {post.is_pinned ? "고정 해제" : "상단 고정"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "삭제 중..." : "삭제"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <Link href={`/board/${post.id}`} className="block">
          <div className="mb-4">
            <p className="text-gray-700 line-clamp-3">{post.content}</p>
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
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image
                src={post.author?.avatar || "/placeholder.svg?height=32&width=32"}
                alt={post.author?.name || "Author"}
                fill
              />
            </div>
            <span className="text-sm">{post.author?.name}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onLike(post.id)
              }}
              className={`flex items-center text-sm ${post.isLiked ? "text-red-500" : "text-gray-500"} hover:text-red-500 transition-colors`}
              aria-label={post.isLiked ? "좋아요 취소" : "좋아요"}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-red-500" : ""}`} />
              <span>{post.likes}</span>
            </button>
            <div className="flex items-center text-sm text-gray-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.comments_count || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
