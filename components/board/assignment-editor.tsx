"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { FileText, Upload, X, Loader2, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { uploadFile } from "@/lib/upload-client"
import RichTextEditor from "@/components/rich-text-editor"

interface AssignmentEditorProps {
  onSubmit?: (formData: FormData) => void
  isSubmitting?: boolean
  initialData?: {
    title?: string
    level?: string
    content?: string
    completed?: boolean
    reviewerNote?: string
    password?: string
  }
  isAdmin?: boolean
  currentUserId?: string
}

export function AssignmentEditor({
  onSubmit,
  isSubmitting: externalIsSubmitting,
  initialData,
  isAdmin = false,
  currentUserId,
}: AssignmentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [level, setLevel] = useState(initialData?.level || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [richContent, setRichContent] = useState(initialData?.content || "")
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [reviewerNote, setReviewerNote] = useState(initialData?.reviewerNote || "")
  const [password, setPassword] = useState(initialData?.password || "")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingFile, setUploadingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const allowedTypes = [".pdf", ".hwp", ".txt", ".doc", ".docx"]
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        setErrors({ ...errors, file: "PDF, HWP, TXT, DOC, DOCX 파일만 업로드 가능합니다" })
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, file: "파일 크기는 10MB 이하여야 합니다" })
        return
      }

      setFile(selectedFile)
      setErrors({ ...errors, file: "" })
    }
  }

  const removeFile = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = "제목을 입력해주세요"
    }

    if (!level) {
      newErrors.level = "난이도를 선택해주세요"
    }

    if (!useRichEditor && !content.trim()) {
      newErrors.content = "내용을 입력해주세요"
    }

    if (useRichEditor && !richContent.trim()) {
      newErrors.richContent = "내용을 입력해주세요"
    }

    if (!password.trim()) {
      newErrors.password = "과제 비밀번호를 입력해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    if (onSubmit) {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("level", level)
      formData.append("content", useRichEditor ? richContent : content)
      formData.append("password", password)
      formData.append("useRichEditor", useRichEditor.toString())

      if (isAdmin && reviewerNote) {
        formData.append("reviewerNote", reviewerNote)
      }

      if (file) {
        formData.append("attachment", file)
      }

      onSubmit(formData)
      return
    }

    // 기본 제출 로직
    setIsSubmitting(true)

    try {
      let attachmentUrl = null

      // 파일 업로드
      if (file) {
        setUploadingFile(true)
        const uploadResult = await uploadFile(file, { folder: "assignments" })
        if (uploadResult.success && uploadResult.data) {
          attachmentUrl = uploadResult.data.publicUrl
        }
        setUploadingFile(false)
      }

      // 과제 저장
      const assignmentData = {
        title,
        content: useRichEditor ? richContent : content,
        level,
        password,
        author_id: currentUserId || "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f", // 임시 ID
        reviewer_note: isAdmin ? reviewerNote : null,
        attachment_url: attachmentUrl,
      }

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "과제 저장에 실패했습니다")
      }

      const newAssignment = await response.json()
      console.log("새 과제 저장됨:", newAssignment)

      // 성공 시 게시판으로 리다이렉트
      router.push("/board")
    } catch (error) {
      console.error("과제 저장 오류:", error)
      setErrors({ submit: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다" })
    } finally {
      setIsSubmitting(false)
      setUploadingFile(false)
    }
  }

  const submitting = externalIsSubmitting || isSubmitting

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errors.submit}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">
          제목 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="과제 제목을 입력하세요"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">
          난이도 <span className="text-red-500">*</span>
        </Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger id="level" className={errors.level ? "border-red-500" : ""}>
            <SelectValue placeholder="난이도를 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">기초반</SelectItem>
            <SelectItem value="intermediate">중급반</SelectItem>
            <SelectItem value="advanced">전문반</SelectItem>
          </SelectContent>
        </Select>
        {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          <Lock className="inline h-4 w-4 mr-1" />
          과제 비밀번호 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="과제를 보기 위한 비밀번호를 설정하세요"
          className={errors.password ? "border-red-500" : ""}
        />
        {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        <p className="text-xs text-gray-500">학생들이 과제를 보려면 이 비밀번호를 입력해야 합니다.</p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">
            내용 <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">리치 에디터 사용</span>
            <Switch checked={useRichEditor} onCheckedChange={setUseRichEditor} />
          </div>
        </div>

        {useRichEditor ? (
          <div className="border rounded-md">
            <RichTextEditor initialContent={richContent} onChange={setRichContent} />
            {errors.richContent && <p className="text-sm text-red-500 mt-1">{errors.richContent}</p>}
          </div>
        ) : (
          <>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="과제 내용을 입력하세요"
              className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment">첨부파일</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="attachment"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.hwp,.txt,.doc,.docx"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
            disabled={uploadingFile}
          >
            <Upload size={16} />
            {uploadingFile ? "업로드 중..." : "파일 업로드"}
          </Button>
          <span className="text-sm text-gray-500">지원 파일: PDF, HWP, TXT, DOC, DOCX (최대 10MB)</span>
        </div>
        {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
        {file && (
          <Card className="p-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      {isAdmin && (
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="reviewerNote">검토자 노트 (관리자 전용)</Label>
          <Textarea
            id="reviewerNote"
            value={reviewerNote}
            onChange={(e) => setReviewerNote(e.target.value)}
            placeholder="이 과제에 대한 노트나 피드백을 추가하세요"
            className="min-h-[100px]"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          취소
        </Button>
        <Button type="submit" disabled={submitting || uploadingFile}>
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              등록 중...
            </>
          ) : (
            "과제 등록"
          )}
        </Button>
      </div>
    </form>
  )
}

// Add default export for direct import
export default function StandaloneAssignmentEditor() {
  return <AssignmentEditor />
}
