"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface VideoDebugProps {
  videoUrl: string
  imageUrl: string
}

export default function VideoDebug({ videoUrl, imageUrl }: VideoDebugProps) {
  const [videoStatus, setVideoStatus] = useState<"loading" | "success" | "error">("loading")
  const [imageStatus, setImageStatus] = useState<"loading" | "success" | "error">("loading")
  const [videoError, setVideoError] = useState<string | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)

  useEffect(() => {
    // 비디오 URL 테스트
    if (videoUrl) {
      const video = document.createElement("video")

      video.onloadeddata = () => {
        setVideoStatus("success")
      }

      video.onerror = (e) => {
        setVideoStatus("error")
        setVideoError(`비디오 로드 실패: ${video.error?.message || "알 수 없는 오류"}`)
      }

      // CORS 오류 감지
      video.onabort = () => {
        setVideoStatus("error")
        setVideoError("비디오 로드가 중단되었습니다. CORS 정책 문제일 수 있습니다.")
      }

      video.src = videoUrl
    } else {
      setVideoStatus("error")
      setVideoError("비디오 URL이 제공되지 않았습니다.")
    }

    // 이미지 URL 테스트
    if (imageUrl) {
      const img = new Image()

      img.onload = () => {
        setImageStatus("success")
      }

      img.onerror = () => {
        setImageStatus("error")
        setImageError("이미지 로드 실패")
      }

      img.src = imageUrl
    } else {
      setImageStatus("error")
      setImageError("이미지 URL이 제공되지 않았습니다.")
    }
  }, [videoUrl, imageUrl])

  if (videoStatus === "loading" || imageStatus === "loading") {
    return <div className="p-4 text-sm text-gray-500">미디어 리소스 확인 중...</div>
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-md">
      <h3 className="font-semibold">미디어 리소스 디버그</h3>

      <div>
        <h4 className="font-medium">비디오 상태:</h4>
        {videoStatus === "success" ? (
          <div className="text-green-600">✅ 비디오 URL이 유효합니다: {videoUrl}</div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ❌ {videoError}
              <div className="mt-1 text-xs break-all">URL: {videoUrl}</div>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div>
        <h4 className="font-medium">이미지 상태:</h4>
        {imageStatus === "success" ? (
          <div className="text-green-600">✅ 이미지 URL이 유효합니다: {imageUrl}</div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ❌ {imageError}
              <div className="mt-1 text-xs break-all">URL: {imageUrl}</div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
