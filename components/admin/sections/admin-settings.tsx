"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Save } from "lucide-react"

export default function AdminSettings() {
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState({
    site_name: "",
    site_description: "",
    kakao_inquiry_link: "",
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
        </CardContent>
      </Card>
    </div>
  )
}
