"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Save, Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

interface AssignmentFormData {
  title: string
  content: string
  level: string
  password: string
  attachment_url?: string
}

export default function AssignmentEditor() {
  const router = useRouter()
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    content: "",
    level: "",
    password: "",
    attachment_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleInputChange = (field: keyof AssignmentFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const { url } = await response.json()
        handleInputChange("attachment_url", url)
        toast.success("파일이 업로드되었습니다!")
      } else {
        toast.error("파일 업로드에 실패했습니다.")
      }
    } catch (error) {
      console.error("파일 업로드 오류:", error)
      toast.error("파일 업로드 중 오류가 발생했습니다.")
    } finally {
      setUploadingFile(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 필수 필드 검증
    if (!formData.title.trim()) {
      toast.error("제목을 입력해주세요.")
      return
    }
    if (!formData.content.trim()) {
      toast.error("내용을 입력해주세요.")
      return
    }
    if (!formData.level) {
      toast.error("난이도를 선택해주세요.")
      return
    }
    if (!formData.password.trim()) {
      toast.error("과제 비밀번호를 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      // 현재 사용자 정보 가져오기
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error("로그인이 필요합니다.")
        return
      }

      console.log("📝 과제 등록 시작:", {
        title: formData.title,
        level: formData.level,
        author_id: currentUser.id,
      })

      // 과제 등록 API 호출
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          level: formData.level,
          author_id: currentUser.id,
          attachment_url: formData.attachment_url || null,
          password: formData.password.trim(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("✅ 과제 등록 성공:", result)
        toast.success("과제가 성공적으로 등록되었습니다!")

        // 과제 게시판으로 이동
        router.push("/board")
      } else {
        const errorData = await response.json()
        console.error("❌ 과제 등록 실패:", errorData)
        toast.error(errorData.error || "과제 등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("💥 과제 등록 오류:", error)
      toast.error("과제 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLevelInfo = (level: string) => {
    const levelMap = {
      beginner: {
        label: "기초반",
        color: "bg-green-100 text-green-800",
        description: "프로그래밍 입문자를 위한 기초 과제",
      },
      intermediate: {
        label: "중급반",
        color: "bg-blue-100 text-blue-800",
        description: "기본기를 다진 학습자를 위한 중급 과제",
      },
      advanced: {
        label: "전문반",
        color: "bg-purple-100 text-purple-800",
        description: "고급 개발자를 위한 심화 과제",
      },
    }
    return (
      levelMap[level as keyof typeof levelMap] || { label: level, color: "bg-gray-100 text-gray-800", description: "" }
    )
  }

  const isFormValid = formData.title.trim() && formData.content.trim() && formData.level && formData.password.trim()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">새 과제 등록</h1>
        <p className="text-gray-600">학생들에게 새로운 과제를 등록해보세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📝 기본 정보
              {isFormValid && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title">과제 제목 *</Label>
              <Input
                id="title"
                placeholder="예: React 컴포넌트 만들기"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-lg"
              />
            </div>

            {/* 난이도 선택 */}
            <div className="space-y-2">
              <Label htmlFor="level">난이도 *</Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="난이도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">기초반</Badge>
                      <span>프로그래밍 입문자</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">중급반</Badge>
                      <span>기본기를 다진 학습자</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">전문반</Badge>
                      <span>고급 개발자</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.level && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Badge className={getLevelInfo(formData.level).color}>{getLevelInfo(formData.level).label}</Badge>
                  <span>{getLevelInfo(formData.level).description}</span>
                </div>
              )}
            </div>

            {/* 과제 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password">과제 비밀번호 *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="학생들이 과제를 확인할 때 사용할 비밀번호"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-gray-500">
                💡 학생들이 과제 내용을 확인하기 위해 입력해야 하는 비밀번호입니다.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 과제 내용 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              📋 과제 내용
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={previewMode ? "outline" : "default"}
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? "편집" : "미리보기"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {previewMode ? (
              <div className="min-h-[200px] p-4 border rounded-md bg-gray-50">
                <div className="prose max-w-none">
                  <h3>{formData.title || "과제 제목"}</h3>
                  <div className="whitespace-pre-wrap">{formData.content || "과제 내용을 입력하세요..."}</div>
                  {formData.attachment_url && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-medium text-blue-800">📎 첨부파일</p>
                      <a
                        href={formData.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {formData.attachment_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Textarea
                  placeholder="과제 설명, 요구사항, 제출 방법 등을 자세히 작성해주세요..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="min-h-[200px] resize-none"
                />

                {/* 파일 업로드 */}
                <div className="space-y-2">
                  <Label htmlFor="file-upload">첨부파일 (선택사항)</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        id="file-upload"
                        type="file"
                        onChange={handleFileUpload}
                        className="hidden"
                        accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("file-upload")?.click()}
                        disabled={uploadingFile}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingFile ? "업로드 중..." : "파일 선택"}
                      </Button>
                    </div>
                    {formData.attachment_url && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>파일이 업로드되었습니다</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInputChange("attachment_url", "")}
                          className="text-red-500 hover:text-red-700"
                        >
                          제거
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">지원 형식: PDF, DOC, DOCX, TXT, ZIP, RAR (최대 10MB)</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-between items-center">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            취소
          </Button>

          <div className="flex gap-2">
            {!isFormValid && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">필수 항목을 모두 입력해주세요</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2 min-w-[120px]"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "등록 중..." : "과제 등록"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
