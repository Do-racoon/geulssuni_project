"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, CheckCircle, AlertCircle, Download, FileText } from "lucide-react"
import { toast } from "sonner"

interface AssignmentSubmissionFormProps {
  assignmentId: string
  currentUser: any
  isOverdue: boolean
  maxSubmissions: number
  currentSubmissions: number
}

export default function AssignmentSubmissionForm({
  assignmentId,
  currentUser,
  isOverdue,
  maxSubmissions,
  currentSubmissions,
}: AssignmentSubmissionFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submissionCount, setSubmissionCount] = useState(0)
  const [maxUserSubmissions, setMaxUserSubmissions] = useState(1)
  const [canSubmitMore, setCanSubmitMore] = useState(true)
  const [existingSubmissions, setExistingSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkExistingSubmissions()
  }, [assignmentId, currentUser])

  const checkExistingSubmissions = async () => {
    if (!currentUser) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log("제출 확인 요청:", { assignmentId, studentName: currentUser.name })

      const response = await fetch(`/api/assignments/${assignmentId}/submissions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: currentUser.name }),
      })

      console.log("API 응답 상태:", response.status)
      console.log("API 응답 헤더:", response.headers.get("content-type"))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API 오류 응답:", errorText)
        throw new Error(`API 요청 실패: ${response.status}`)
      }

      const data = await response.json()
      console.log("제출 확인 응답:", data)

      setSubmissionCount(data.submissionCount || 0)
      setMaxUserSubmissions(data.maxSubmissions || 1)
      setCanSubmitMore(data.canSubmitMore || false)
      setExistingSubmissions(data.submissions || [])
    } catch (error) {
      console.error("기존 제출 확인 오류:", error)
      toast.error("제출 정보를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // 파일 크기 제한 (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB를 초과할 수 없습니다.")
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("파일을 선택해주세요.")
      return
    }

    if (isOverdue) {
      toast.error("마감일이 지났습니다.")
      return
    }

    if (maxSubmissions > 0 && currentSubmissions >= maxSubmissions) {
      toast.error("제출 인원이 마감되었습니다.")
      return
    }

    setSubmitting(true)

    try {
      // 제출 직전 인원 재확인
      const assignmentResponse = await fetch(`/api/assignments/${assignmentId}`)

      if (!assignmentResponse.ok) {
        throw new Error("과제 정보를 불러올 수 없습니다.")
      }

      const assignmentData = await assignmentResponse.json()
      console.log("과제 정보 응답:", assignmentData)

      // 안전한 속성 접근
      const latestAssignment = assignmentData.data || assignmentData
      const maxSubs = latestAssignment?.max_submissions || 0
      const currentSubs = latestAssignment?.current_submissions || 0

      if (maxSubs > 0 && currentSubs >= maxSubs) {
        toast.error("제출 인원이 마감되었습니다.")
        setSubmitting(false)
        return
      }

      // 파일 업로드
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error("파일 업로드 실패")
      }

      const { url: fileUrl } = await uploadResponse.json()
      setUploading(false)

      // 과제 제출
      const submitResponse = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          studentName: currentUser.name,
          fileUrl,
          fileName: file.name,
        }),
      })

      if (submitResponse.ok) {
        toast.success("과제가 성공적으로 제출되었습니다!")
        setFile(null)
        checkExistingSubmissions()
      } else {
        const errorData = await submitResponse.json()
        toast.error(errorData.error || "제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("제출 오류:", error)
      toast.error("제출 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 tracking-wide">로딩 중...</p>
      </div>
    )
  }

  if (submissionCount > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-6 bg-gray-50 border border-gray-200 p-6">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-light tracking-widest uppercase mb-2">
            SUBMISSIONS: {submissionCount}/{maxUserSubmissions}
          </h3>

          {/* 기존 제출물들 표시 */}
          <div className="space-y-3 mb-4">
            {existingSubmissions.map((submission, index) => (
              <div key={submission.id} className="flex items-center justify-center gap-2 text-sm">
                <span className="text-gray-600">#{index + 1}</span>
                <FileText className="h-4 w-4 text-gray-600" />
                <a
                  href={submission.file_url}
                  download={submission.file_name}
                  className="text-blue-600 hover:underline tracking-wide flex items-center"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {submission.file_name}
                  <Download className="h-4 w-4 ml-1" />
                </a>
                <span className="text-gray-500 text-xs">{new Date(submission.submitted_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>

          {canSubmitMore && !isOverdue && (
            <p className="text-green-600 tracking-wide mb-4">
              추가 제출 가능: {maxUserSubmissions - submissionCount}회 남음
            </p>
          )}
        </div>

        {/* 추가 제출 폼 */}
        {canSubmitMore && !isOverdue && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="file-upload" className="text-sm font-light tracking-widest uppercase">
                추가 파일 제출 ({submissionCount + 1}/{maxUserSubmissions})
              </Label>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="w-full border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                    style={{ borderRadius: "0" }}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {file ? file.name : "CHOOSE ADDITIONAL FILE"}
                  </Button>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!file || submitting || uploading}
              className="w-full bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
              style={{ borderRadius: "0" }}
            >
              {uploading ? "UPLOADING..." : submitting ? "SUBMITTING..." : "SUBMIT ADDITIONAL FILE"}
            </Button>
          </form>
        )}
      </div>
    )
  }

  if (isOverdue) {
    return (
      <div className="text-center py-6 bg-gray-50 border border-gray-200 p-6">
        <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-light tracking-widest uppercase text-red-600">SUBMISSION CLOSED</h3>
        <p className="text-gray-600 tracking-wide">The deadline has passed.</p>
      </div>
    )
  }

  if (maxSubmissions > 0 && currentSubmissions >= maxSubmissions) {
    return (
      <div className="text-center py-6 bg-gray-50 border border-gray-200 p-6">
        <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-4" />
        <h3 className="text-lg font-light tracking-widest uppercase text-orange-600">SUBMISSION FULL</h3>
        <p className="text-gray-600 tracking-wide">Maximum number of submissions reached.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="file-upload" className="text-sm font-light tracking-widest uppercase">
          SELECT FILE TO SUBMIT *
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
              className="w-full border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
              style={{ borderRadius: "0" }}
            >
              <Upload className="h-4 w-4 mr-2" />
              {file ? file.name : "CHOOSE FILE"}
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-500 tracking-wide">
          SUPPORTED FORMATS: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (MAX 10MB)
        </p>
      </div>

      <Button
        type="submit"
        disabled={!file || submitting || uploading}
        className="w-full bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
        style={{ borderRadius: "0" }}
      >
        {uploading ? "UPLOADING..." : submitting ? "SUBMITTING..." : "SUBMIT ASSIGNMENT"}
      </Button>
    </form>
  )
}
