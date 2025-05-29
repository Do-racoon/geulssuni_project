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
import { Upload, Save, AlertCircle, CheckCircle, Calendar, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

interface AssignmentFormData {
  title: string
  content: string
  level: string
  due_date: string
  max_submissions: number
  attachment_url?: string
}

export default function AssignmentEditor() {
  const router = useRouter()
  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    content: "",
    level: "",
    due_date: "",
    max_submissions: 0,
    attachment_url: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)

  const handleInputChange = (field: keyof AssignmentFormData, value: string | number) => {
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
    if (!formData.due_date) {
      toast.error("마감일을 선택해주세요.")
      return
    }
    if (formData.max_submissions <= 0) {
      toast.error("최대 제출 인원을 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error("로그인이 필요합니다.")
        return
      }

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          description: formData.content.trim().substring(0, 200),
          class_level: formData.level,
          due_date: formData.due_date,
          max_submissions: formData.max_submissions,
          author_id: currentUser.id,
          attachment_url: formData.attachment_url || null,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success("과제가 성공적으로 등록되었습니다!")
        router.push("/board")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "과제 등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("과제 등록 오류:", error)
      toast.error("과제 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLevelInfo = (level: string) => {
    const levelMap = {
      beginner: {
        label: "BASIC",
        color: "bg-white text-black border border-black",
        description: "프로그래밍 입문자를 위한 기초 과제",
      },
      intermediate: {
        label: "INTERMEDIATE",
        color: "bg-black text-white border border-black",
        description: "기본기를 다진 학습자를 위한 중급 과제",
      },
      advanced: {
        label: "ADVANCED",
        color: "bg-gray-800 text-white border border-gray-800",
        description: "고급 개발자를 위한 심화 과제",
      },
    }
    return (
      levelMap[level as keyof typeof levelMap] || {
        label: level,
        color: "bg-gray-100 text-gray-800 border border-gray-300",
        description: "",
      }
    )
  }

  const isFormValid =
    formData.title.trim() &&
    formData.content.trim() &&
    formData.level &&
    formData.due_date &&
    formData.max_submissions > 0

  // 최소 마감일 (현재 시간 + 1시간)
  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-light text-black mb-4 tracking-widest uppercase">NEW ASSIGNMENT</h1>
        <p className="text-gray-600 tracking-wide">CREATE A NEW ASSIGNMENT FOR STUDENTS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 */}
        <Card className="border-black" style={{ borderRadius: "0" }}>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-3 text-xl font-light tracking-widest uppercase">
              BASIC INFORMATION
              {isFormValid && <CheckCircle className="h-5 w-5 text-black" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {/* 제목 */}
            <div className="space-y-3">
              <Label htmlFor="title" className="text-sm font-light tracking-widest uppercase">
                ASSIGNMENT TITLE *
              </Label>
              <Input
                id="title"
                placeholder="ENTER ASSIGNMENT TITLE"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="text-lg border-black focus:border-black focus:ring-0 font-light tracking-wide"
                style={{ borderRadius: "0" }}
              />
            </div>

            {/* 난이도 선택 */}
            <div className="space-y-3">
              <Label htmlFor="level" className="text-sm font-light tracking-widest uppercase">
                DIFFICULTY LEVEL *
              </Label>
              <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                <SelectTrigger className="border-black focus:border-black focus:ring-0" style={{ borderRadius: "0" }}>
                  <SelectValue placeholder="SELECT DIFFICULTY LEVEL" />
                </SelectTrigger>
                <SelectContent style={{ borderRadius: "0" }}>
                  <SelectItem value="beginner">
                    <div className="flex items-center gap-3">
                      <Badge
                        className="bg-white text-black border border-black tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        BASIC
                      </Badge>
                      <span className="tracking-wide">FOR PROGRAMMING BEGINNERS</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div className="flex items-center gap-3">
                      <Badge
                        className="bg-black text-white border border-black tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        INTERMEDIATE
                      </Badge>
                      <span className="tracking-wide">FOR INTERMEDIATE LEARNERS</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div className="flex items-center gap-3">
                      <Badge
                        className="bg-gray-800 text-white border border-gray-800 tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        ADVANCED
                      </Badge>
                      <span className="tracking-wide">FOR ADVANCED DEVELOPERS</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {formData.level && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Badge
                    className={getLevelInfo(formData.level).color + " tracking-widest"}
                    style={{ borderRadius: "0" }}
                  >
                    {getLevelInfo(formData.level).label}
                  </Badge>
                  <span className="tracking-wide">{getLevelInfo(formData.level).description}</span>
                </div>
              )}
            </div>

            {/* 마감일과 제출 현황 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 마감일 */}
              <div className="space-y-3">
                <Label
                  htmlFor="due_date"
                  className="text-sm font-light tracking-widest uppercase flex items-center gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  DUE DATE *
                </Label>
                <Input
                  id="due_date"
                  type="datetime-local"
                  min={minDateTime}
                  value={formData.due_date}
                  onChange={(e) => handleInputChange("due_date", e.target.value)}
                  className="border-black focus:border-black focus:ring-0 font-light tracking-wide"
                  style={{ borderRadius: "0" }}
                />
              </div>

              {/* 최대 제출 인원 */}
              <div className="space-y-3">
                <Label
                  htmlFor="max_submissions"
                  className="text-sm font-light tracking-widest uppercase flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  MAX SUBMISSIONS *
                </Label>
                <Input
                  id="max_submissions"
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="0"
                  value={formData.max_submissions || ""}
                  onChange={(e) => handleInputChange("max_submissions", Number.parseInt(e.target.value) || 0)}
                  className="border-black focus:border-black focus:ring-0 font-light tracking-wide"
                  style={{ borderRadius: "0" }}
                />
                <p className="text-xs text-gray-500 tracking-wide">MAXIMUM NUMBER OF STUDENTS WHO CAN SUBMIT</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 과제 내용 */}
        <Card className="border-black" style={{ borderRadius: "0" }}>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center justify-between text-xl font-light tracking-widest uppercase">
              ASSIGNMENT CONTENT
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={previewMode ? "outline" : "default"}
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                  style={{ borderRadius: "0" }}
                >
                  {previewMode ? "EDIT" : "PREVIEW"}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {previewMode ? (
              <div className="min-h-[200px] p-6 border border-gray-300 bg-gray-50" style={{ borderRadius: "0" }}>
                <div className="prose max-w-none">
                  <h3 className="font-light tracking-wide">{formData.title || "ASSIGNMENT TITLE"}</h3>
                  <div className="whitespace-pre-wrap tracking-wide font-light">
                    {formData.content || "ENTER ASSIGNMENT CONTENT..."}
                  </div>
                  {formData.attachment_url && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200" style={{ borderRadius: "0" }}>
                      <p className="text-sm font-light tracking-widest uppercase text-blue-800">ATTACHMENT</p>
                      <a
                        href={formData.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline tracking-wide"
                      >
                        {formData.attachment_url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <Textarea
                  placeholder="ENTER ASSIGNMENT DESCRIPTION, REQUIREMENTS, SUBMISSION GUIDELINES..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="min-h-[200px] resize-none border-black focus:border-black focus:ring-0 font-light tracking-wide"
                  style={{ borderRadius: "0" }}
                />

                {/* 파일 업로드 */}
                <div className="space-y-3">
                  <Label htmlFor="file-upload" className="text-sm font-light tracking-widest uppercase">
                    ATTACHMENT (OPTIONAL)
                  </Label>
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
                        className="flex items-center gap-2 border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                        style={{ borderRadius: "0" }}
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingFile ? "UPLOADING..." : "SELECT FILE"}
                      </Button>
                    </div>
                    {formData.attachment_url && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="tracking-wide">FILE UPLOADED SUCCESSFULLY</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleInputChange("attachment_url", "")}
                          className="text-red-500 hover:text-red-700 tracking-widest uppercase"
                          style={{ borderRadius: "0" }}
                        >
                          REMOVE
                        </Button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 tracking-wide">
                    SUPPORTED FORMATS: PDF, DOC, DOCX, TXT, ZIP, RAR (MAX 10MB)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
            style={{ borderRadius: "0" }}
          >
            CANCEL
          </Button>

          <div className="flex gap-4 items-center">
            {!isFormValid && (
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm tracking-wide">PLEASE FILL ALL REQUIRED FIELDS</span>
              </div>
            )}
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2 min-w-[150px] bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
              style={{ borderRadius: "0" }}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "CREATING..." : "CREATE ASSIGNMENT"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
