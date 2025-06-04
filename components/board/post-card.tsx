"use client"

import { memo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Eye, Heart, MessageCircle, Clock, ImageIcon } from "lucide-react"

interface PostCardProps {
  post: {
    id: string
    title: string
    content: string
    category: string
    type: string
    created_at: string
    views: number
    likes: number
    comments_count: number
    image_url?: string
    author: {
      id: string
      name: string
    }
    author_id: string
  }
}

function PostCard({ post }: PostCardProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  console.log(`[PostCard] Rendering card for post: ${post.id}`)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) {
      return "방금 전"
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`
    } else if (diffInHours < 24 * 7) {
      const days = Math.floor(diffInHours / 24)
      return `${days}일 전`
    } else {
      return date.toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "general":
        return "FREE"
      case "sharing":
        return "SHARE"
      case "question":
        return "QUESTION"
      case "tech":
        return "TECH"
      case "design":
        return "DESIGN"
      default:
        return category.toUpperCase()
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "free":
        return "FREE"
      case "notice":
        return "NOTICE"
      case "qna":
        return "Q&A"
      default:
        return type.toUpperCase()
    }
  }

  const getAvatarUrl = (name: string) => {
    return `/placeholder.svg?height=32&width=32&query=${encodeURIComponent(name || "user")}`
  }

  // content에서 HTML 태그 제거하고 미리보기 텍스트 생성
  const getPreviewText = (content: string, maxLength = 150) => {
    if (!content) return ""

    // HTML 태그 제거
    const textOnly = content.replace(/<[^>]*>/g, "")

    // 길이 제한
    if (textOnly.length <= maxLength) {
      return textOnly
    }

    return textOnly.substring(0, maxLength) + "..."
  }

  // content에서 첫 번째 이미지 URL 추출
  const extractFirstImage = (content: string) => {
    if (!content) return null

    // img 태그에서 src 추출
    const imgRegex = /<img[^>]+src="([^">]+)"/i
    const match = content.match(imgRegex)

    if (match && match[1]) {
      return match[1]
    }

    return null
  }

  // 이미지 URL 검증
  const isValidImageUrl = (url: string) => {
    if (!url) return false

    try {
      const urlObj = new URL(url)
      return urlObj.protocol === "http:" || urlObj.protocol === "https:"
    } catch {
      return false
    }
  }

  // 표시할 이미지 URL 결정
  const getDisplayImage = () => {
    // 1. post.image_url이 있으면 우선 사용
    if (post.image_url && isValidImageUrl(post.image_url)) {
      return post.image_url
    }

    // 2. content에서 첫 번째 이미지 추출
    const contentImage = extractFirstImage(post.content)
    if (contentImage && isValidImageUrl(contentImage)) {
      return contentImage
    }

    return null
  }

  const displayImage = getDisplayImage()

  const handleImageError = () => {
    console.log(`[PostCard] Image error for post ${post.id}:`, displayImage)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log(`[PostCard] Image loaded for post ${post.id}:`, displayImage)
    setImageLoading(false)
    setImageError(false)
  }

  return (
    <Link href={`/board/${post.id}`} className="block">
      <div className="border border-gray-200 hover:border-black transition-colors bg-white hover:shadow-sm overflow-hidden">
        {/* 이미지 섹션 */}
        {displayImage && !imageError && (
          <div className="relative w-full h-48 bg-gray-100">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center text-gray-400">
                  <ImageIcon className="h-8 w-8 mb-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              </div>
            )}
            <Image
              src={displayImage || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover"
              style={{ objectFit: "cover" }}
              onError={handleImageError}
              onLoad={handleImageLoad}
              unoptimized={displayImage.includes("supabase") || displayImage.includes("blob")}
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-xs px-2 py-1 bg-white text-black border border-black tracking-wider font-light">
                {getCategoryLabel(post.category)}
              </span>
              <span className="text-xs text-gray-500 tracking-wider font-light">{getTypeLabel(post.type)}</span>
            </div>
            <div className="flex items-center text-xs text-gray-500 tracking-wider font-light">
              <Clock className="h-3 w-3 mr-1" />
              {formatDate(post.created_at)}
            </div>
          </div>

          <h3 className="text-lg font-light tracking-wider mb-3 line-clamp-2 hover:text-gray-700 transition-colors">
            {post.title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 font-light">
            {getPreviewText(post.content)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-6 h-6 overflow-hidden mr-2 rounded-full">
                <Image
                  src={getAvatarUrl(post.author?.name || "Anonymous")}
                  alt={post.author?.name || "Author"}
                  fill
                  className="object-cover"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <span className="text-sm text-gray-700 tracking-wider font-light">
                {post.author?.name || "Anonymous"}
              </span>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                <span className="tracking-wider font-light">{post.views || 0}</span>
              </div>
              <div className="flex items-center">
                <Heart className="h-3 w-3 mr-1" />
                <span className="tracking-wider font-light">{post.likes || 0}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-3 w-3 mr-1" />
                <span className="tracking-wider font-light">{post.comments_count || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(PostCard)
