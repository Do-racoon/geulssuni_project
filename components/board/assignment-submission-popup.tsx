"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Upload, Send } from "lucide-react"
import { toast } from "sonner"

interface AssignmentSubmissionPopupProps {
  assignmentId: string
  onSubmissionSuccess: () => void
  disabled?: boolean
}

export default function AssignmentSubmissionPopup({
  assignmentId,
  onSubmissionSuccess,
  disabled = false,
}: AssignmentSubmissionPopupProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    studentName: "",
    comment: "",
    file: null as File | null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 파일 크기 제한 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB를 초과할 수 없습니다.")
        return
      }
      setFormData((prev) => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.studentName.trim()) {
      toast.error("이름을 입력해주세요.")
      return
    }

    if (!formData.file) {
      toast.error("파일을 선택해주세요.")
      return
    }

    setSubmitting(true)

    try {
      const submitFormData = new FormData()
      submitFormData.append("studentName", formData.studentName.trim())
      submitFormData.append("comment", formData.comment.trim())
      submitFormData.append("file", formData.file)

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: submitFormData,
      })

      if (response.ok) {
        toast.success("과제가 성공적으로 제출되었습니다!")
        setFormData({ studentName: "", comment: "", file: null })
        setOpen(false)
        onSubmissionSuccess()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("제출 오류:", error)
      toast.error("제출 중 오류가 발생했습니다.")
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({ studentName: "", comment: "", file: null })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
          style={{ borderRadius: "0" }}
        >
          <Upload className="h-4 w-4 mr-2" />
          SUBMIT ASSIGNMENT
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md" style={{ borderRadius: "0" }}>
        <DialogHeader>
          <DialogTitle className="tracking-widest uppercase font-light">SUBMIT ASSIGNMENT</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="studentName" className="text-sm font-light tracking-widest uppercase">
              NAME *
            </Label>
            <Input
              id="studentName"
              value={formData.studentName}
              onChange={(e) => setFormData((prev) => ({ ...prev, studentName: e.target.value }))}
              placeholder="Enter your name"
              className="border-black"
              style={{ borderRadius: "0" }}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm font-light tracking-widest uppercase">
              FILE *
            </Label>
            <div className="relative">
              <input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById("file")?.click()}
                className="w-full border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                style={{ borderRadius: "0" }}
              >
                <Upload className="h-4 w-4 mr-2" />
                {formData.file ? formData.file.name : "CHOOSE FILE"}
              </Button>
            </div>
            <p className="text-xs text-gray-500 tracking-wide">
              SUPPORTED: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (MAX 10MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment" className="text-sm font-light tracking-widest uppercase">
              COMMENT (OPTIONAL)
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData((prev) => ({ ...prev, comment: e.target.value }))}
              placeholder="Add any comments about your submission..."
              className="border-black min-h-[80px]"
              style={{ borderRadius: "0" }}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 border-black text-black hover:bg-gray-100 tracking-widest uppercase font-light"
              style={{ borderRadius: "0" }}
            >
              CANCEL
            </Button>
            <Button
              type="submit"
              disabled={submitting || !formData.studentName.trim() || !formData.file}
              className="flex-1 bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
              style={{ borderRadius: "0" }}
            >
              <Send className="h-4 w-4 mr-2" />
              {submitting ? "SUBMITTING..." : "SUBMIT"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
