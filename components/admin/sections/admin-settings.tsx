"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Save, Video, ImageIcon, AlertCircle, Info, Database } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@supabase/supabase-js"

// 파일 크기 제한
const MAX_VIDEO_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB

// 기본 버킷 이름
const DEFAULT_BUCKET = "uploads"

// Supabase 클라이언트 생성 (클라이언트 사이드)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

// 파일 타입별 최대 크기 반환 함수
const getMaxFileSize = (file: File): number => {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  console.log("🔍 파일 타입 확인:", { fileName, fileType, size: file.size })

  // 비디오 파일 확인 (MIME 타입 우선, 확장자 보조)
  const isVideo =
    fileType.startsWith("video/") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".webm") ||
    fileName.endsWith(".ogg") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".avi") ||
    fileName.endsWith(".mkv")

  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
  console.log(`📏 파일 크기 제한: ${isVideo ? "영상" : "이미지"} - ${maxSize / 1024 / 1024}MB`)

  return maxSize
}

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [bucketExists, setBucketExists] = useState<boolean | null>(null)
  const [showBucketWarning, setShowBucketWarning] = useState(false)
  const [isCreatingBucket, setIsCreatingBucket] = useState(false)

  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    default_contact_url: "",
    hero_video_url: "",
    hero_fallback_image: "",
  })

  const [storageDebug, setStorageDebug] = useState<any>(null)
  const [isDebugging, setIsDebugging] = useState(false)

  // 설정 로드 및 버킷 확인
  useEffect(() => {
    loadSettings()
    checkBucketExists()
  }, [])

  // 버킷 존재 여부 확인
  const checkBucketExists = async () => {
    try {
      console.log(`🪣 '${DEFAULT_BUCKET}' 버킷 확인 중...`)
      const { data: buckets, error } = await supabase.storage.listBuckets()

      if (error) {
        console.error("❌ 버킷 목록 조회 오류:", error)
        setBucketExists(false)
        setShowBucketWarning(true)
        return
      }

      const exists = buckets?.some((bucket) => bucket.name === DEFAULT_BUCKET)
      console.log(`${exists ? "✅" : "❌"} '${DEFAULT_BUCKET}' 버킷 ${exists ? "존재함" : "존재하지 않음"}`)

      setBucketExists(exists)
      setShowBucketWarning(!exists)
    } catch (error) {
      console.error("❌ 버킷 확인 중 오류:", error)
      setBucketExists(false)
      setShowBucketWarning(true)
    }
  }

  // 서버를 통해 버킷 생성 요청
  const createBucketViaServer = async () => {
    try {
      setIsCreatingBucket(true)
      console.log(`🪣 서버를 통해 '${DEFAULT_BUCKET}' 버킷 생성 요청...`)

      const response = await fetch("/api/create-bucket", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucketName: DEFAULT_BUCKET }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "버킷 생성 실패")
      }

      console.log(`✅ '${DEFAULT_BUCKET}' 버킷 생성 성공:`, data)
      setBucketExists(true)
      setShowBucketWarning(false)

      toast({
        title: "버킷 생성 완료",
        description: `'${DEFAULT_BUCKET}' 버킷이 성공적으로 생성되었습니다.`,
      })

      return true
    } catch (error) {
      console.error("❌ 버킷 생성 요청 오류:", error)
      toast({
        title: "버킷 생성 실패",
        description: `버킷 생성에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        variant: "destructive",
      })
      return false
    } finally {
      setIsCreatingBucket(false)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()

      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          site_name: data.settings.site_name || "",
          site_description: data.settings.site_description || "",
          default_contact_url: data.settings.default_contact_url || "",
          hero_video_url: data.settings.hero_video_url || "",
          hero_fallback_image: data.settings.hero_fallback_image || "",
        }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
      toast({
        title: "오류",
        description: "설정을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const updateSetting = async (key: string, value: string) => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update setting")
      }

      toast({
        title: "설정 저장됨",
        description: `${key} 설정이 성공적으로 업데이트되었습니다.`,
      })
    } catch (error) {
      console.error("Error updating setting:", error)
      toast({
        title: "오류",
        description: `설정 업데이트에 실패했습니다: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // 파일 크기를 사람이 읽기 쉬운 형태로 변환
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  // 서버를 통한 안전한 파일 업로드
  const handleServerUpload = async (file: File, settingKey: string): Promise<void> => {
    try {
      setIsUploading(true)
      setUploadError(null)
      setUploadProgress(0)

      console.log("📤 서버 업로드 시작:", {
        fileName: file.name,
        size: file.size,
        type: file.type,
        sizeFormatted: formatFileSize(file.size),
      })

      // 파일 타입별 크기 제한 확인
      const maxSize = getMaxFileSize(file)
      const isVideo = maxSize === MAX_VIDEO_SIZE

      if (file.size > maxSize) {
        const fileType = isVideo ? "영상" : "이미지"
        const maxSizeMB = maxSize / 1024 / 1024
        const errorMsg = `${fileType} 파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다. (현재: ${formatFileSize(file.size)})`

        console.error("❌ " + errorMsg)
        setUploadError(errorMsg)
        toast({
          title: "파일 크기 초과",
          description: errorMsg,
          variant: "destructive",
        })
        return
      }

      // 진행률 시뮬레이션
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null) return 10
          if (prev >= 90) return prev
          return prev + Math.random() * 20
        })
      }, 200)

      try {
        // FormData 생성
        const formData = new FormData()
        formData.append("file", file)
        formData.append("bucketName", DEFAULT_BUCKET)
        formData.append("folder", "home")

        console.log("📤 서버 API로 업로드 요청...")

        // 서버 API로 업로드
        const response = await fetch("/api/upload-file-safe", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setUploadProgress(100)

        // 응답 처리
        if (!response.ok) {
          const errorText = await response.text()
          console.error("❌ 서버 응답 오류:", response.status, errorText)

          // JSON 파싱 시도
          try {
            const errorData = JSON.parse(errorText)
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
          } catch (parseError) {
            // HTML 오류 페이지인지 확인
            if (errorText.includes("Request Entity Too Large") || errorText.includes("413")) {
              throw new Error("파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.")
            } else if (errorText.includes("500") || errorText.includes("Internal Server Error")) {
              throw new Error("서버 내부 오류가 발생했습니다.")
            } else {
              throw new Error(`서버 응답 오류: ${response.status} ${response.statusText}`)
            }
          }
        }

        const data = await response.json()

        if (!data.success) {
          throw new Error(data.error || "업로드 실패")
        }

        console.log("✅ 서버 업로드 성공:", data.data)

        const publicUrl = data.data.publicUrl

        // 설정 업데이트
        await updateSetting(settingKey, publicUrl)

        setSettings((prev) => ({
          ...prev,
          [settingKey]: publicUrl,
        }))

        // 버킷 상태 업데이트
        setBucketExists(true)
        setShowBucketWarning(false)

        toast({
          title: "파일 업로드 완료",
          description: `파일이 성공적으로 업로드되었습니다.`,
        })
      } catch (uploadError) {
        clearInterval(progressInterval)
        throw uploadError
      }
    } catch (error) {
      console.error("❌ 서버 업로드 오류:", error)
      setUploadError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      toast({
        title: "업로드 오류",
        description: `파일 업로드에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("🎬 비디오 파일 선택:", {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeFormatted: formatFileSize(file.size),
      })

      // 파일 타입이 없는 경우 확장자로 확인
      const fileName = file.name.toLowerCase()
      const fileType = file.type.toLowerCase()

      const isVideoFile =
        fileType.startsWith("video/") ||
        fileName.endsWith(".mp4") ||
        fileName.endsWith(".webm") ||
        fileName.endsWith(".ogg") ||
        fileName.endsWith(".mov")

      console.log("🔍 비디오 파일 검증:", { fileName, fileType, isVideoFile })

      if (isVideoFile) {
        await handleServerUpload(file, "hero_video_url")
      } else {
        toast({
          title: "파일 형식 오류",
          description: "비디오 파일만 업로드 가능합니다. (MP4, WebM, OGG, MOV)",
          variant: "destructive",
        })
      }
    }

    // 파일 입력 초기화
    if (videoInputRef.current) {
      videoInputRef.current.value = ""
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0]
    if (file) {
      console.log("🖼️ 이미지 파일 선택:", {
        name: file.name,
        size: file.size,
        type: file.type,
        sizeFormatted: formatFileSize(file.size),
      })

      // 파일 타입이 없는 경우 확장자로 확인
      const fileName = file.name.toLowerCase()
      const fileType = file.type.toLowerCase()

      const isImageFile =
        fileType.startsWith("image/") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg") ||
        fileName.endsWith(".png") ||
        fileName.endsWith(".gif") ||
        fileName.endsWith(".webp") ||
        fileName.endsWith(".svg")

      console.log("🔍 이미지 파일 검증:", { fileName, fileType, isImageFile })

      if (isImageFile) {
        await handleServerUpload(file, "hero_fallback_image")
      } else {
        toast({
          title: "파일 형식 오류",
          description: "이미지 파일만 업로드 가능합니다. (JPG, PNG, GIF, WebP, SVG)",
          variant: "destructive",
        })
      }
    }

    // 파일 입력 초기화
    if (imageInputRef.current) {
      imageInputRef.current.value = ""
    }
  }

  const checkStorageStatus = async () => {
    try {
      setIsDebugging(true)
      const response = await fetch("/api/storage-debug")
      const data = await response.json()
      setStorageDebug(data)

      // 스토리지 상태 확인과 동시에 버킷 존재 여부도 업데이트
      if (data.success && data.data.buckets) {
        const exists = data.data.buckets.some((bucket: any) => bucket.name === DEFAULT_BUCKET)
        console.log(`${exists ? "✅" : "❌"} '${DEFAULT_BUCKET}' 버킷 ${exists ? "존재함" : "존재하지 않음"}`)

        setBucketExists(exists)
        setShowBucketWarning(!exists)

        if (exists) {
          toast({
            title: "스토리지 상태 확인 완료",
            description: `버킷 ${data.data.buckets.length}개, 파일 ${data.data.recentFiles?.length || 0}개 발견. 업로드 버튼이 활성화되었습니다.`,
          })
        } else {
          toast({
            title: "스토리지 상태 확인 완료",
            description: `버킷 ${data.data.buckets.length}개 발견. uploads 버킷이 없습니다. 버킷 생성 버튼을 클릭하세요.`,
          })
        }
      } else {
        toast({
          title: "스토리지 상태 확인 실패",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Storage debug error:", error)
      toast({
        title: "스토리지 디버그 오류",
        description: "스토리지 상태를 확인할 수 없습니다.",
        variant: "destructive",
      })
    } finally {
      setIsDebugging(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-gray-500">웹사이트 기본 설정을 관리합니다</p>
      </div>

      <Alert variant="info" className="bg-blue-50 border-blue-200">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertDescription className="text-blue-700">
          파일 업로드 시 영상은 최대 10MB, 이미지는 최대 5MB까지 업로드 가능합니다. 파일은 서버를 통해 안전하게 Supabase
          Storage에 업로드됩니다.
        </AlertDescription>
      </Alert>

      {showBucketWarning && (
        <Alert variant="warning" className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-700 flex items-center justify-between">
            <span>업로드를 위한 스토리지 버킷이 없습니다. 파일 업로드를 위해 버킷을 생성해주세요.</span>
            <Button
              onClick={createBucketViaServer}
              disabled={isCreatingBucket}
              variant="outline"
              size="sm"
              className="ml-2 bg-white"
            >
              <Database className="w-4 h-4 mr-1" />
              {isCreatingBucket ? "생성 중..." : "버킷 생성"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>업로드 오류: {uploadError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>웹사이트 설정</CardTitle>
          <CardDescription>사이트 이름, 설명, 문의 링크를 설정합니다</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="siteName">사이트 이름</Label>
            <div className="flex gap-2">
              <Input
                id="siteName"
                value={settings.site_name}
                onChange={(e) => setSettings((prev) => ({ ...prev, site_name: e.target.value }))}
                placeholder="글쓰니"
                disabled={isSaving}
              />
              <Button onClick={() => updateSetting("site_name", settings.site_name)} disabled={isSaving} size="sm">
                <Save className="w-4 h-4 mr-1" />
                저장
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteDescription">사이트 설명</Label>
            <div className="flex gap-2">
              <Input
                id="siteDescription"
                value={settings.site_description}
                onChange={(e) => setSettings((prev) => ({ ...prev, site_description: e.target.value }))}
                placeholder="글쓰기 교육 플랫폼"
                disabled={isSaving}
              />
              <Button
                onClick={() => updateSetting("site_description", settings.site_description)}
                disabled={isSaving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" />
                저장
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kakaoLink">카카오톡 문의 링크</Label>
            <div className="flex gap-2">
              <Input
                id="kakaoLink"
                value={settings.default_contact_url}
                onChange={(e) => setSettings((prev) => ({ ...prev, default_contact_url: e.target.value }))}
                placeholder="https://open.kakao.com/o/your-link"
                disabled={isSaving}
              />
              <Button
                onClick={() => updateSetting("default_contact_url", settings.default_contact_url)}
                disabled={isSaving}
                size="sm"
              >
                <Save className="w-4 h-4 mr-1" />
                저장
              </Button>
            </div>
            <p className="text-sm text-gray-500">강의 페이지에서 사용될 카카오톡 문의 링크입니다</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroVideo">홈페이지 배경 영상</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="heroVideo"
                  value={settings.hero_video_url}
                  onChange={(e) => setSettings((prev) => ({ ...prev, hero_video_url: e.target.value }))}
                  placeholder="/videos/background-ocean.mp4"
                  disabled={isSaving}
                />
                <Button
                  onClick={() => updateSetting("hero_video_url", settings.hero_video_url)}
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  저장
                </Button>
              </div>
              <div className="flex gap-2">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*,.mp4,.webm,.ogg,.mov"
                  onChange={handleVideoUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => videoInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <Video className="w-4 h-4 mr-1" />
                  {isUploading ? `업로드 중... ${uploadProgress ? uploadProgress + "%" : ""}` : "영상 파일 업로드"}
                </Button>
                <span className="text-xs text-gray-500 self-center">영상: 최대 10MB (서버 업로드)</span>
              </div>
              {settings.hero_video_url && (
                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  <strong>현재 설정:</strong> {settings.hero_video_url}
                  <br />
                  <strong>타입:</strong>{" "}
                  {settings.hero_video_url.startsWith("http") ? "🌐 Supabase Storage URL" : "📁 로컬 파일 경로"}
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">홈페이지 히어로 섹션의 배경 영상 (URL 입력 또는 파일 업로드)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroImage">대체 배경 이미지</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  id="heroImage"
                  value={settings.hero_fallback_image}
                  onChange={(e) => setSettings((prev) => ({ ...prev, hero_fallback_image: e.target.value }))}
                  placeholder="/images/hero-fallback.jpg"
                  disabled={isSaving}
                />
                <Button
                  onClick={() => updateSetting("hero_fallback_image", settings.hero_fallback_image)}
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="w-4 h-4 mr-1" />
                  저장
                </Button>
              </div>
              <div className="flex gap-2">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.svg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => imageInputRef.current?.click()}
                  disabled={isUploading}
                  variant="outline"
                  size="sm"
                >
                  <ImageIcon className="w-4 h-4 mr-1" />
                  {isUploading ? `업로드 중... ${uploadProgress ? uploadProgress + "%" : ""}` : "이미지 파일 업로드"}
                </Button>
                <span className="text-xs text-gray-500 self-center">이미지: 최대 5MB (서버 업로드)</span>
              </div>
            </div>
            <p className="text-sm text-gray-500">영상 로드 실패 시 표시될 배경 이미지 (URL 입력 또는 파일 업로드)</p>
          </div>
          <div className="space-y-2 pt-4 border-t">
            <Label>스토리지 디버그</Label>
            <div className="flex gap-2">
              <Button onClick={checkStorageStatus} disabled={isDebugging} variant="outline" size="sm">
                {isDebugging ? "확인 중..." : "스토리지 상태 확인 및 새로고침"}
              </Button>
              <Button onClick={createBucketViaServer} disabled={isCreatingBucket} variant="outline" size="sm">
                <Database className="w-4 h-4 mr-1" />
                {isCreatingBucket ? "생성/업데이트 중..." : "버킷 설정 업데이트"}
              </Button>
            </div>
            {storageDebug && (
              <div className="text-xs bg-gray-50 p-3 rounded mt-2">
                <strong>스토리지 상태:</strong>
                <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(storageDebug, null, 2)}</pre>
              </div>
            )}
            <p className="text-sm text-gray-500">Supabase Storage 버킷과 파일 상태를 확인합니다</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
