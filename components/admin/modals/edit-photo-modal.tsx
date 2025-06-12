"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { uploadPhotoFile } from "@/lib/upload-utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface Photo {
  id: string
  title: string
  description: string
  short_description: string
  thumbnail_url: string
}

interface EditPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  photo: Photo
  onSubmit: (photo: Partial<Photo>) => void
}

export default function EditPhotoModal({ isOpen, onClose, photo, onSubmit }: EditPhotoModalProps) {
  const [title, setTitle] = useState(photo.title)
  const [description, setDescription] = useState(photo.description)
  const [shortDescription, setShortDescription] = useState(photo.short_description)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const { toast } = useToast()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setTitle(photo.title)
      setDescription(photo.description)
      setShortDescription(photo.short_description)
      setFile(null)
      setPreviewUrl(null)
      setUploadError(null)
      setUploadSuccess(null)
    }
  }, [isOpen, photo])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const url = URL.createObjectURL(selectedFile)
      setPreviewUrl(url)
      setUploadError(null)
      setUploadSuccess(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile)
      const url = URL.createObjectURL(droppedFile)
      setPreviewUrl(url)
      setUploadError(null)
      setUploadSuccess(null)
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload an image file",
        variant: "destructive",
      })
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const removeFile = () => {
    setFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      let imageUrl = photo.thumbnail_url

      if (file) {
        setIsUploading(true)
        console.log("Uploading new photo via API...")
        const uploadedUrl = await uploadPhotoFile(file)
        if (uploadedUrl) {
          imageUrl = uploadedUrl
          setUploadSuccess(`New photo uploaded successfully: ${uploadedUrl}`)
          console.log("New photo uploaded successfully:", uploadedUrl)
        } else {
          setUploadError("Failed to upload new image via API")
          throw new Error("Failed to upload new image via API")
        }
        setIsUploading(false)
      }

      onSubmit({
        title,
        description,
        short_description: shortDescription,
        thumbnail_url: imageUrl,
      })

      toast({
        title: "Success",
        description: file ? "Photo updated with new image!" : "Photo updated successfully!",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to update photo. Please try again.")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update photo. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    removeFile()
    onClose()
    setUploadError(null)
    setUploadSuccess(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Photo</DialogTitle>
          <p className="text-sm text-gray-500">New photos will be uploaded via secure API</p>
        </DialogHeader>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {uploadSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{uploadSuccess}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Current Image */}
            <div>
              <Label>Current Image</Label>
              <div className="mt-2">
                <img
                  src={photo.thumbnail_url || "/placeholder.svg"}
                  alt={photo.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>

            {/* New Image Upload Section */}
            <div>
              <Label>Upload New Image (Optional)</Label>
              {!file ? (
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Drop new image here</p>
                    <p className="text-xs text-gray-500">or</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById("edit-file-input")?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                  <p className="text-xs text-gray-400">Will be uploaded via secure API</p>
                </div>
              ) : (
                <div className="mt-2 relative">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    <img src={previewUrl || ""} alt="New preview" className="w-full h-48 object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={removeFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    New image: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <p className="text-xs text-gray-400">Ready for secure upload</p>
                </div>
              )}
              <input id="edit-file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Enter photo title"
              />
            </div>

            <div>
              <Label htmlFor="shortDescription">Short Description *</Label>
              <Input
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                required
                placeholder="Brief description (displayed in gallery)"
              />
            </div>

            <div>
              <Label htmlFor="description">Full Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                placeholder="Detailed description of the photo"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading via API..." : isSubmitting ? "Saving..." : "Update Photo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
