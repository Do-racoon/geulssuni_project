"use client"

import { memo, useState, useEffect } from "react"
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
  const [hasImage, setHasImage] = useState(false)

  // 이미지 존재 여부 확인
  useEffect(() => {
    const checkImage = () => {
      console.log(`[PostCard] Checking image for post ${post.id}`)
      console.log(`[PostCard] Post image_url:`, post.image_url)
      console.log(`[PostCard] Post content preview:`, post.content?.substring(0, 200))

      // 1. post.image_url 확인
      if (post.image_url && isValidImageUrl(post.image_url)) {
        console.log(`[PostCard] ✅ Found image_url for post ${post.id}:`, post.image_url)
        setHasImage(true)
        return
      }

      // 2. content에서 이미지 태그 확인
      if (post.content) {
        const imgRegex = /<img[^>]+src="([^">]+)"/i
        const match = post.content.match(imgRegex)
        console.log(`[PostCard] Image regex match:`, match)

        if (match && match[1] && isValidImageUrl(match[1])) {
          console.log(`[PostCard] ✅ Found image in content for post ${post.id}:`, match[1])
          setHasImage(true)
          return
        }
      }

      console.log(`[PostCard] ❌ No image found for post ${post.id}`)
      setHasImage(false)
    }

    checkImage()
  }, [post.id, post.image_url, post.content])

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

    // 이미지 태그를 완전히 제거
    let cleanText = content.replace(/<img[^>]*>/gi, "")

    // 모든 HTML 태그와 속성 제거
    cleanText = cleanText.replace(/<[^>]*>/g, "")

    // HTML 속성들 제거 (src=", alt=", class=" 등)
    cleanText = cleanText.replace(/\b\w+="[^"]*"/g, "")
    cleanText = cleanText.replace(/\b\w+='[^']*'/g, "")

    // URL 패턴 제거
    cleanText = cleanText.replace(/https?:\/\/[^\s]+/g, "")
    cleanText = cleanText.replace(/www\.[^\s]+/g, "")

    // 특수 문자와 불필요한 텍스트 제거
    cleanText = cleanText.replace(/src="/g, "")
    cleanText = cleanText.replace(/alt="/g, "")
    cleanText = cleanText.replace(/class="/g, "")
    cleanText = cleanText.replace(/style="/g, "")
    cleanText = cleanText.replace(/width="/g, "")
    cleanText = cleanText.replace(/height="/g, "")

    // 연속된 공백과 줄바꿈 정리
    cleanText = cleanText.replace(/\s+/g, " ").trim()

    // 빈 문자열이면 기본 텍스트 반환
    if (!cleanText || cleanText.length < 10) {
      return "내용을 확인하려면 클릭하세요."
    }

    // 길이 제한
    if (cleanText.length <= maxLength) {
      return cleanText
    }

    return cleanText.substring(0, maxLength) + "..."
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
    const imgRegex = /<img[^>]+src="([^">]+)"/i
    const match = post.content?.match(imgRegex)
    if (match && match[1] && isValidImageUrl(match[1])) {
      return match[1]
    }

    return null
  }

  const displayImage = getDisplayImage()

  const handleImageError = () => {
    console.log(`[PostCard] Image error for post ${post.id}:`, displayImage)
    setImageError(true)
    setImageLoading(false)
    setHasImage(false)
  }

  const handleImageLoad = () => {
    console.log(`[PostCard] Image loaded for post ${post.id}:`, displayImage)
    setImageLoading(false)
    setImageError(false)
    setHasImage(true)
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

              {/* 이미지 아이콘 표시 */}
              {hasImage && (
                <>
                  {console.log(`[PostCard] 🏷️ Rendering IMAGE tag for post ${post.id}`)}
                  <span className="flex items-center bg-black text-white px-2 py-1 text-xs rounded">
                    <ImageIcon className="h-3 w-3 mr-1" />
                    <span className="tracking-wider font-light">IMAGE</span>
                  </span>
                </>
              )}
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
            {(() => {
              const preview = getPreviewText(post.content)
              return preview && preview.length > 0 ? preview : "게시글 내용을 확인하려면 클릭하세요."
            })()}
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
      {/* 개발 환경 디버그 정보 */}
      {process.env.NODE_ENV === "development" && (
        <div className="text-xs text-red-500 mt-2">
          DEBUG: hasImage={hasImage.toString()}, image_url={post.image_url || "none"}
        </div>
      )}
    </Link>
  )
}

// React.memo를 사용하여 불필요한 리렌더링 방지
export default memo(PostCard)
