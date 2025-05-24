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
import { FileText, Upload, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import RichTextEditor from "@/components/rich-text-editor"

interface AssignmentEditorProps {
  onSubmit: (formData: FormData) => void
  isSubmitting: boolean
  initialData?: {
    title?: string
    level?: string
    content?: string
    completed?: boolean
    reviewerNote?: string
  }
  isAdmin?: boolean
}

export function AssignmentEditor({ onSubmit, isSubmitting, initialData, isAdmin = false }: AssignmentEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "")
  const [level, setLevel] = useState(initialData?.level || "")
  const [content, setContent] = useState(initialData?.content || "")
  const [richContent, setRichContent] = useState(initialData?.content || "")
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [completed, setCompleted] = useState(initialData?.completed || false)
  const [reviewerNote, setReviewerNote] = useState(initialData?.reviewerNote || "")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      const allowedTypes = [".pdf", ".hwp", ".txt"]
      const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf(".")).toLowerCase()

      if (!allowedTypes.includes(fileExtension)) {
        setErrors({ ...errors, file: "Only .pdf, .hwp, and .txt files are allowed" })
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
      newErrors.title = "Title is required"
    }

    if (!level) {
      newErrors.level = "Level is required"
    }

    if (!useRichEditor && !content.trim()) {
      newErrors.content = "Content is required"
    }

    if (useRichEditor && !richContent.trim()) {
      newErrors.richContent = "Content is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    const formData = new FormData()
    formData.append("title", title)
    formData.append("level", level)
    formData.append("content", useRichEditor ? richContent : content)
    formData.append("useRichEditor", useRichEditor.toString())
    formData.append("completed", completed.toString())

    if (isAdmin && reviewerNote) {
      formData.append("reviewerNote", reviewerNote)
    }

    if (file) {
      formData.append("attachment", file)
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter assignment title"
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">
          Level <span className="text-red-500">*</span>
        </Label>
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger id="level" className={errors.level ? "border-red-500" : ""}>
            <SelectValue placeholder="Select difficulty level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        {errors.level && <p className="text-sm text-red-500">{errors.level}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="content">
            Content <span className="text-red-500">*</span>
          </Label>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Use rich editor</span>
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
              placeholder="Enter assignment content"
              className={`min-h-[200px] ${errors.content ? "border-red-500" : ""}`}
            />
            {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="attachment">Attachment</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="attachment"
            type="file"
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.hwp,.txt"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload size={16} />
            Upload File
          </Button>
          <span className="text-sm text-gray-500">Accepted file types: .pdf, .hwp, .txt</span>
        </div>
        {errors.file && <p className="text-sm text-red-500">{errors.file}</p>}
        {file && (
          <Card className="p-3 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} />
                <span className="text-sm font-medium">{file.name}</span>
                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(2)} KB)</span>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={removeFile} className="h-8 w-8 p-0">
                <X size={16} />
              </Button>
            </div>
          </Card>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="completed" checked={completed} onCheckedChange={setCompleted} />
        <Label htmlFor="completed">Mark as Completed</Label>
      </div>

      {isAdmin && (
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor="reviewerNote">Reviewer's Note (Admin Only)</Label>
          <Textarea
            id="reviewerNote"
            value={reviewerNote}
            onChange={(e) => setReviewerNote(e.target.value)}
            placeholder="Add notes or feedback for this assignment"
            className="min-h-[100px]"
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Assignment"}
        </Button>
      </div>
    </form>
  )
}

// Add default export for direct import
export default function StandaloneAssignmentEditor() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // Simulate API call to create assignment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real implementation, you would send the formData to your API
      console.log("Form data submitted:", Object.fromEntries(formData.entries()))

      // Redirect to the board page
      router.push("/board")
    } catch (error) {
      console.error("Error creating assignment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <AssignmentEditor onSubmit={handleSubmit} isSubmitting={isSubmitting} />
}
