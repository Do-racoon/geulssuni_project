"use client"

import { useState, useEffect, useCallback } from "react"
import { Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createSupabaseClient } from "@/lib/supabase/client"

interface PostActionsProps {
  post: {
    id: string
    likes: number
    title: string
  }
}

export default function PostActions({ post }: PostActionsProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.likes || 0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCheckedLikeStatus, setHasCheckedLikeStatus] = useState(false)

  console.log(`[PostActions] Component mounted for post: ${post.id}`)

  // 좋아요 상태 확인 함수를 useCallback으로 메모이제이션
  const checkLikeStatus = useCallback(async () => {
    if (hasCheckedLikeStatus) {
      console.log(`[PostActions] Like status already checked for post: ${post.id}`)
      return
    }

    try {
      console.log(`[PostActions] Checking like status for post: ${post.id}`)
      const supabase = createSupabaseClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log(`[PostActions] No user found, skipping like status check`)
        setHasCheckedLikeStatus(true)
        return
      }

      const response = await fetch(`/api/board-posts/${post.id}/like-status`)
      if (response.ok) {
        const data = await response.json()
        console.log(`[PostActions] Like status response:`, data)
        setIsLiked(data.isLiked)
      } else {
        console.error(`[PostActions] Failed to check like status:`, response.status)
      }
    } catch (error) {
      console.error(`[PostActions] Error checking like status:`, error)
    } finally {
      setHasCheckedLikeStatus(true)
    }
  }, [post.id, hasCheckedLikeStatus])

  // 좋아요 토글 함수
  const handleLike = useCallback(async () => {
    if (isLoading) {
      console.log(`[PostActions] Like action already in progress`)
      return
    }

    setIsLoading(true)
    console.log(`[PostActions] Toggling like for post: ${post.id}`)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const response = await fetch(`/api/board-posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`[PostActions] Like toggle response:`, data)
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
      } else {
        console.error(`[PostActions] Failed to toggle like:`, response.status)
        alert("좋아요 처리 중 오류가 발생했습니다.")
      }
    } catch (error) {
      console.error(`[PostActions] Error toggling like:`, error)
      alert("좋아요 처리 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [post.id, isLoading])

  // 공유 함수
  const handleShare = useCallback(async () => {
    console.log(`[PostActions] Sharing post: ${post.id}`)

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url: window.location.href,
        })
        console.log(`[PostActions] Native share completed`)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("링크가 클립보드에 복사되었습니다.")
        console.log(`[PostActions] Link copied to clipboard`)
      }
    } catch (error) {
      console.error(`[PostActions] Error sharing:`, error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert("링크가 클립보드에 복사되었습니다.")
      } catch (clipboardError) {
        console.error(`[PostActions] Clipboard fallback failed:`, clipboardError)
        alert("공유 기능을 사용할 수 없습니다.")
      }
    }
  }, [post.title])

  // 컴포넌트 마운트 시 좋아요 상태 확인 (한 번만)
  useEffect(() => {
    console.log(`[PostActions] useEffect triggered for post: ${post.id}, hasChecked: ${hasCheckedLikeStatus}`)
    checkLikeStatus()
  }, [checkLikeStatus]) // checkLikeStatus는 useCallback으로 메모이제이션됨

  // post.likes가 변경될 때만 likesCount 업데이트
  useEffect(() => {
    console.log(`[PostActions] Updating likes count from ${likesCount} to ${post.likes}`)
    setLikesCount(post.likes || 0)
  }, [post.likes])

  return (
    <div className="flex items-center space-x-4 py-6 border-t border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center space-x-2 ${
          isLiked ? "text-red-600 hover:text-red-700" : "text-gray-600 hover:text-gray-700"
        }`}
      >
        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
        <span className="tracking-wider font-light">{isLoading ? "..." : likesCount}</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-700"
      >
        <Share2 className="h-5 w-5" />
        <span className="tracking-wider font-light">SHARE</span>
      </Button>
    </div>
  )
}
