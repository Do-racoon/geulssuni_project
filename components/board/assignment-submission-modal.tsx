"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Upload, CheckCircle, AlertCircle, Download, FileText, Send } from "lucide-react"
import { toast } from "sonner"

interface AssignmentSubmissionModalProps {
  assignmentId: string
  currentUser: any
  isOverdue: boolean
  maxSubmissions: number
  currentSubmissions: number
}

export default function AssignmentSubmissionModal({
  assignmentId,
  currentUser,
  isOverdue,
  maxSubmissions,
  currentSubmissions,
}: AssignmentSubmissionModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [studentName, setStudentName] = useState("")
  const [comment, setComment] = useState("")
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [existingSubmission, setExistingSubmission] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 현재 사용자 이름으로 초기화
    if (currentUser?.name) {
      setStudentName(currentUser.name)
    }
  }, [currentUser])

  useEffect(() => {
    // 이름이 설정된 후에 제출 확인
    if (studentName) {
      checkExistingSubmission()
    } else {
      setLoading(false)
    }
  }, [assignmentId, studentName])

  const checkExistingSubmission = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser?.id || null,
          studentName: studentName.trim(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.hasSubmitted) {
          setHasSubmitted(true)
          setExistingSubmission(data.submission)
        }
      }
    } catch (error) {
      console.error("기존 제출 확인 오류:", error)
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStudentName(e.target.value)
    // 이름이 변경되면 제출 상태 초기화
    setHasSubmitted(false)
    setExistingSubmission(null)
  }

  const handleNameBlur = () => {
    // 이름 입력이 완료되면 제출 확인
    if (studentName.trim()) {
      checkExistingSubmission()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error("파일을 선택해주세요.")
      return
    }

    if (!studentName.trim()) {
      toast.error("이름을 입력해주세요.")
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
          studentId: currentUser?.id || null,
          studentName: studentName.trim(),
          fileUrl,
          fileName: file.name,
          comment: comment.trim(),
        }),
      })

      if (submitResponse.ok) {
        toast.success("과제가 성공적으로 제출되었습니다!")
        setHasSubmitted(true)
        setIsOpen(false)
        checkExistingSubmission()
        // 폼 초기화
        setFile(null)
        setComment("")
        // 페이지 새로고침으로 제출 목록 업데이트
        window.location.reload()
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

  const openModal = () => {
    setIsOpen(true)
    setFile(null)
    setComment("")
    if (currentUser?.name) {
      setStudentName(currentUser.name)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 tracking-wide">로딩 중...</p>
      </div>
    )
  }

  if (hasSubmitted && existingSubmission) {
    return (
      <div className="text-center py-6 bg-gray-50 border border-gray-200 p-6">
        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-light tracking-widest uppercase mb-2 text-black">ALREADY SUBMITTED</h3>
        <p className="text-gray-600 tracking-wide mb-4">
          SUBMITTED ON: {new Date(existingSubmission.submitted_at).toLocaleString()}
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-gray-600" />
          <a
            href={existingSubmission.file_url}
            download={existingSubmission.file_name}
            className="text-blue-600 hover:underline tracking-wide flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {existingSubmission.file_name}
            <Download className="h-4 w-4 ml-1" />
          </a>
        </div>

        {existingSubmission.comment && (
          <div className="bg-white p-4 border border-gray-200 mb-4">
            <p className="text-sm text-gray-600 font-light">COMMENT:</p>
            <p className="text-gray-800">{existingSubmission.comment}</p>
          </div>
        )}

        {existingSubmission.is_checked && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 border border-green-300"
            style={{ borderRadius: "0" }}
          >
            <CheckCircle className="h-4 w-4" />
            <span className="tracking-widest uppercase font-light">CHECKED BY INSTRUCTOR</span>
          </div>
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
    <>
      <Button
        onClick={openModal}
        className="w-full bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
        style={{ borderRadius: "0" }}
      >
        <Send className="h-4 w-4 mr-2" />
        SUBMIT ASSIGNMENT
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-light tracking-widest uppercase text-black">
              SUBMIT ASSIGNMENT
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* 이름 입력 */}
              <div className="space-y-2">
                <Label htmlFor="student-name" className="text-sm font-light tracking-widest uppercase text-black">
                  YOUR NAME *
                </Label>
                <Input
                  id="student-name"
                  type="text"
                  value={studentName}
                  onChange={handleNameChange}
                  onBlur={handleNameBlur}
                  placeholder="Enter your name"
                  className="border-gray-300 focus:border-black text-black bg-white"
                  required
                />
                {studentName && hasSubmitted && (
                  <p className="text-sm text-red-600">이 이름으로 이미 제출된 과제가 있습니다.</p>
                )}
              </div>

              {/* 파일 선택 */}
              <div className="space-y-2">
                <Label htmlFor="file-upload" className="text-sm font-light tracking-widest uppercase text-black">
                  SELECT FILE *
                </Label>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      id="file-upload"
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                      required
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
                  SUPPORTED: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (MAX 10MB)
                </p>
              </div>

              {/* 코멘트 입력 */}
              <div className="space-y-2">
                <Label htmlFor="comment" className="text-sm font-light tracking-widest uppercase text-black">
                  COMMENT (OPTIONAL)
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add any comments about your submission..."
                  className="border-gray-300 focus:border-black min-h-[100px] text-black bg-white"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="border-black text-black hover:bg-black hover:text-white tracking-widest uppercase font-light w-full sm:w-auto"
              >
                CANCEL
              </Button>
              <Button
                type="submit"
                disabled={!file || !studentName.trim() || submitting || uploading || hasSubmitted}
                className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light w-full sm:w-auto"
              >
                {uploading ? "UPLOADING..." : submitting ? "SUBMITTING..." : "SUBMIT"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
