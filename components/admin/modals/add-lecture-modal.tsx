"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createLecture } from "@/lib/api/lectures"
import { getAuthors } from "@/lib/api/authors"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import RichTextEditor from "@/components/rich-text-editor"

interface AddLectureModalProps {
  children: React.ReactNode
  onSuccess?: () => void
}

interface Author {
  id: string
  name: string
  email?: string
  bio?: string
}

export default function AddLectureModal({ children, onSuccess }: AddLectureModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [category, setCategory] = useState("")
  const [duration, setDuration] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [contactUrl, setContactUrl] = useState("")
  const [instructorName, setInstructorName] = useState("")
  const [authors, setAuthors] = useState<Author[]>([])
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false)
  const { toast } = useToast()

  // 작가(강사) 목록 로드
  useEffect(() => {
    const loadAuthors = async () => {
      setIsLoadingAuthors(true)
      try {
        const authorsData = await getAuthors()
        setAuthors(authorsData)
      } catch (error) {
        console.error("Failed to load authors:", error)
        toast({
          title: "Warning",
          description: "Failed to load authors list",
          variant: "destructive",
        })
        // 기본 작가 목록 설정
        setAuthors([
          { id: "1", name: "김강사" },
          { id: "2", name: "이강사" },
          { id: "3", name: "박강사" },
          { id: "4", name: "최강사" },
          { id: "5", name: "정강사" },
        ])
      } finally {
        setIsLoadingAuthors(false)
      }
    }

    loadAuthors()
  }, [toast])

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    setThumbnailFile(file)
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "lectures/thumbnails")

      // 업로드 API 경로 수정
      const response = await fetch("/api/upload-supabase", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Upload failed: ${errorText}`)
      }

      const data = await response.json()
      setThumbnailUrl(data.url || data.publicUrl)
      toast({
        title: "Success",
        description: "Thumbnail uploaded successfully",
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Failed to upload thumbnail: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
      setThumbnailFile(null)
    } finally {
      setIsUploading(false)
    }
  }

  const removeThumbnail = () => {
    setThumbnailUrl("")
    setThumbnailFile(null)
  }

  const onSubmit = async () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!instructorName) {
      toast({
        title: "Error",
        description: "Please select an instructor",
        variant: "destructive",
      })
      return
    }

    setIsPending(true)
    try {
      const lectureData: any = {
        title: title.trim(),
        instructor: instructorName, // 작가 이름을 instructor 필드에 저장 (텍스트)
      }

      // 선택적 필드들
      if (description.trim()) {
        lectureData.description = description.trim()
      }

      if (videoUrl.trim()) {
        lectureData.video_url = videoUrl.trim()
      }

      if (category.trim()) {
        lectureData.category = category.trim()
      }

      if (duration && Number.parseInt(duration) > 0) {
        lectureData.duration = Number.parseInt(duration)
      }

      if (thumbnailUrl) {
        lectureData.thumbnail_url = thumbnailUrl
      }

      if (contactUrl.trim()) {
        lectureData.contact_url = contactUrl.trim()
      }

      console.log("Creating lecture with data:", lectureData)
      await createLecture(lectureData)

      toast({
        title: "Success",
        description: "Lecture created successfully",
      })

      // Reset form
      setTitle("")
      setDescription("")
      setVideoUrl("")
      setCategory("")
      setDuration("")
      setThumbnailUrl("")
      setThumbnailFile(null)
      setContactUrl("")
      setInstructorName("")

      if (onSuccess) onSuccess()
    } catch (error) {
      console.error("Error creating lecture:", error)
      toast({
        title: "Error",
        description: "Failed to create lecture: " + (error instanceof Error ? error.message : String(error)),
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Lecture</AlertDialogTitle>
          <AlertDialogDescription>Create a new lecture with all the details.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-6 py-4">
          {/* Basic Information */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter lecture title"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="instructor">Instructor *</Label>
              <Select value={instructorName} onValueChange={setInstructorName}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingAuthors ? "Loading authors..." : "Select an instructor"} />
                </SelectTrigger>
                <SelectContent>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.name}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                initialValue={description}
                onChange={setDescription}
                placeholder="Write lecture description with images, files, and rich formatting..."
              />
              <p className="text-xs text-gray-500">* Rich text editor supports images, files, and formatting.</p>
            </div>
          </div>

          {/* Media */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Media</h3>

            <div className="grid gap-2">
              <Label>Thumbnail Image</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                    id="thumbnail-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="thumbnail-upload"
                    className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {thumbnailUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={thumbnailUrl || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">
                          {isUploading ? "Uploading..." : "Click to upload thumbnail"}
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="videoUrl">Video URL</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video"
              />
            </div>
          </div>

          {/* Details */}
          <div className="grid gap-4">
            <h3 className="text-lg font-medium">Details</h3>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Programming, Design"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 60"
                min="0"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactUrl">Contact URL</Label>
              <Input
                id="contactUrl"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder="Contact URL (auto-filled from settings)"
              />
              <p className="text-xs text-gray-500">* Leave empty to use default contact URL from settings</p>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={isPending || !title.trim() || !instructorName || isUploading}>
            {isPending ? "Creating..." : "Create Lecture"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
