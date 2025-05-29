"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, CheckCircle, Send } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"

interface AssignmentSubmissionFormProps {
  assignmentId: string
  onSubmitSuccess?: () => void
}

export default function AssignmentSubmissionForm({ assignmentId, onSubmitSuccess }: AssignmentSubmissionFormProps) {
  const [comment, setComment] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [fileName, setFileName] = useState("")
  const [uploadingFile, setUploadingFile] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
        setFileUrl(url)
        setFileName(file.name)
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

    if (!fileUrl) {
      toast.error("제출할 파일을 업로드해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        toast.error("로그인이 필요합니다.")
        return
      }

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: currentUser.id,
          student_name: currentUser.name,
          file_url: fileUrl,
          file_name: fileName,
          feedback: comment,
        }),
      })

      if (response.ok) {
        toast.success("과제가 성공적으로 제출되었습니다!")
        setComment("")
        setFileUrl("")
        setFileName("")
        if (onSubmitSuccess) {
          onSubmitSuccess()
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "과제 제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("과제 제출 오류:", error)
      toast.error("과제 제출 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 파일 업로드 */}
      <div className="space-y-3">
        <Label htmlFor="file-upload" className="text-sm font-light tracking-widest uppercase">
          ASSIGNMENT FILE *
        </Label>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
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
          {fileUrl && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="tracking-wide">{fileName || "FILE UPLOADED SUCCESSFULLY"}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFileUrl("")
                  setFileName("")
                }}
                className="text-red-500 hover:text-red-700 tracking-widest uppercase"
                style={{ borderRadius: "0" }}
              >
                REMOVE
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 tracking-wide">
          SUPPORTED FORMATS: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, JPEG, PNG (MAX 10MB)
        </p>
      </div>

      {/* 코멘트 */}
      <div className="space-y-3">
        <Label htmlFor="comment" className="text-sm font-light tracking-widest uppercase">
          COMMENT (OPTIONAL)
        </Label>
        <Textarea
          id="comment"
          placeholder="Add any comments or notes about your submission..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="resize-none border-black focus:border-black focus:ring-0 font-light"
          style={{ borderRadius: "0" }}
        />
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!fileUrl || isSubmitting}
          className="flex items-center gap-2 min-w-[150px] bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
          style={{ borderRadius: "0" }}
        >
          <Send className="h-4 w-4" />
          {isSubmitting ? "SUBMITTING..." : "SUBMIT ASSIGNMENT"}
        </Button>
      </div>
    </form>
  )
}
