"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { RichTextEditor } from "@/components/RichTextEditor"
import { getAuthors } from "@/lib/api/authors"
import { uploadFile } from "@/lib/upload-client"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Lecture {
  id: string
  title: string
  description: string
  instructor: string
  thumbnail_url?: string
  category?: string
  is_published?: boolean
}

interface EditLectureModalProps {
  isOpen: boolean
  onClose: () => void
  lecture: Lecture | null
  onSave: (lecture: any) => void
}

const EditLectureModal = ({ isOpen, onClose, lecture, onSave }: EditLectureModalProps) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [authors, setAuthors] = useState<any[]>([])
  const [selectedAuthorName, setSelectedAuthorName] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [category, setCategory] = useState("")
  const [isPublished, setIsPublished] = useState(false)

  useEffect(() => {
    const loadAuthors = async () => {
      try {
        const authorsData = await getAuthors()
        setAuthors(authorsData)
      } catch (error) {
        console.error("Error loading authors:", error)
      }
    }
    loadAuthors()
  }, [])

  useEffect(() => {
    if (isOpen && lecture) {
      setTitle(lecture.title || "")
      setDescription(lecture.description || "")
      setSelectedAuthorName(lecture.instructor || "")
      setThumbnailPreview(lecture.thumbnail_url || "")
      setCategory(lecture.category || "")
      setIsPublished(lecture.is_published || false)
    }
  }, [isOpen, lecture])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview("")
  }

  const handleUpdateLecture = async () => {
    if (!lecture?.id) {
      toast({
        title: "Error",
        description: "Lecture ID is missing.",
        variant: "destructive",
      })
      return
    }

    if (!selectedAuthorName) {
      toast({
        title: "Error",
        description: "Please select an instructor.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      let thumbnailUrl = lecture.thumbnail_url

      // 새 썸네일이 업로드된 경우
      if (thumbnailFile) {
        try {
          const uploadResult = await uploadFile(thumbnailFile)
          thumbnailUrl = uploadResult.url
        } catch (uploadError) {
          console.error("Error uploading thumbnail:", uploadError)
          toast({
            title: "Warning",
            description: "Failed to upload thumbnail, but lecture will be updated without it.",
            variant: "destructive",
          })
        }
      }

      const updatedLecture = {
        ...lecture,
        title,
        description,
        instructor: selectedAuthorName,
        thumbnail_url: thumbnailUrl,
        category,
        is_published: isPublished,
      }

      await onSave(updatedLecture)
      onClose()
    } catch (error: any) {
      console.error("Error updating lecture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update lecture.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lecture</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* 썸네일 업로드 */}
          <div className="grid gap-2">
            <Label>Thumbnail</Label>
            <div className="flex items-center gap-4">
              {thumbnailPreview ? (
                <div className="relative">
                  <Image
                    src={thumbnailPreview || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    width={100}
                    height={60}
                    className="rounded object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="w-[100px] h-[60px] border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs text-gray-500">No image</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <Label htmlFor="thumbnail-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm">Upload Image</span>
                  </div>
                </Label>
              </div>
            </div>
          </div>

          {/* 제목 */}
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          {/* 강사 선택 */}
          <div className="grid gap-2">
            <Label>Instructor</Label>
            <Select value={selectedAuthorName} onValueChange={setSelectedAuthorName}>
              <SelectTrigger>
                <SelectValue placeholder="Select an instructor" />
              </SelectTrigger>
              <SelectContent>
                {authors.map((author) => (
                  <SelectItem key={author.id} value={author.name}>
                    {author.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAuthorName && <p className="text-sm text-gray-600">Selected: {selectedAuthorName}</p>}
          </div>

          {/* 카테고리 */}
          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Enter category"
            />
          </div>

          {/* 설명 */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Enter lecture description..."
            />
          </div>

          {/* 발행 상태 */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_published">Publish immediately</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateLecture} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditLectureModal
