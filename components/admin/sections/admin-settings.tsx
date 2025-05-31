"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Save, Video, ImageIcon } from "lucide-react"

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    kakao_inquiry_link: "",
    hero_video_url: "",
    hero_fallback_image: "",
  })

  // 설정 로드
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      const data = await response.json()

      if (data.success) {
        setSettings((prev) => ({
          ...prev,
          site_name: data.settings.site_name || "",
          site_description: data.settings.site_description || "",
          kakao_inquiry_link: data.settings.kakao_inquiry_link || "",
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

  const handleFileUpload = async (file: File, settingKey: string) => {
    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append("file", file)
      formData.append("entity_type", "hero_media")
      formData.append("entity_id", "homepage")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload file")
      }

      // 업로드된 파일 URL을 설정에 저장
      const fileUrl = data.url
      await updateSetting(settingKey, fileUrl)

      // 로컬 상태 업데이트
      setSettings((prev) => ({
        ...prev,
        [settingKey]: fileUrl,
      }))

      toast({
        title: "파일 업로드 완료",
        description: "파일이 성공적으로 업로드되고 설정이 저장되었습니다.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "업로드 오류",
        description: `파일 업로드에 실패했습니다: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("video/")) {
        handleFileUpload(file, "hero_video_url")
      } else {
        toast({
          title: "파일 형식 오류",
          description: "비디오 파일만 업로드 가능합니다.",
          variant: "destructive",
        })
      }
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.type.startsWith("image/")) {
        handleFileUpload(file, "hero_fallback_image")
      } else {
        toast({
          title: "파일 형식 오류",
          description: "이미지 파일만 업로드 가능합니다.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-2">Settings</h1>
        <p className="text-gray-500">웹사이트 기본 설정을 관리합니다</p>
      </div>

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
                value={settings.kakao_inquiry_link}
                onChange={(e) => setSettings((prev) => ({ ...prev, kakao_inquiry_link: e.target.value }))}
                placeholder="https://open.kakao.com/o/your-link"
                disabled={isSaving}
              />
              <Button
                onClick={() => updateSetting("kakao_inquiry_link", settings.kakao_inquiry_link)}
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
                  accept="video/*"
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
                  {isUploading ? "업로드 중..." : "영상 파일 업로드"}
                </Button>
              </div>
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
                  accept="image/*"
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
                  {isUploading ? "업로드 중..." : "이미지 파일 업로드"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500">영상 로드 실패 시 표시될 배경 이미지 (URL 입력 또는 파일 업로드)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
