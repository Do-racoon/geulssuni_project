"use client"

import { useState, useEffect } from "react"

interface HeroVideoProps {
  videoUrl: string
  fallbackImage: string
}

export default function HeroVideo({ videoUrl, fallbackImage }: HeroVideoProps) {
  const [videoError, setVideoError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // 컴포넌트가 마운트될 때 비디오 URL 재설정
    setVideoError(false)
    setIsLoaded(false)
  }, [videoUrl])

  const handleVideoError = () => {
    console.error("비디오 로드 실패:", videoUrl)
    setVideoError(true)
  }

  const handleVideoLoaded = () => {
    console.log("비디오 로드 성공:", videoUrl)
    setIsLoaded(true)
  }

  return (
    <>
      {!videoError && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
          poster={fallbackImage}
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}

      {/* 비디오 로드 실패 또는 URL이 없는 경우 폴백 이미지 표시 */}
      <div
        className={`absolute inset-0 w-full h-full object-cover z-0 bg-cover bg-center bg-gray-900 ${
          !videoError && isLoaded ? "opacity-0" : "opacity-100"
        }`}
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${fallbackImage})`,
          transition: "opacity 0.5s ease-in-out",
        }}
      />
    </>
  )
}
