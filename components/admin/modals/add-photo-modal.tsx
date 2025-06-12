"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { uploadPhotoFile } from "@/lib/upload-utils"

interface AddPhotoModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (photo: {
    title: string
    description: string
    short_description: string
    thumbnail_url: string
  }) => void
}

export default function AddPhotoModal({ isOpen, onClose, onSubmit }: AddPhotoModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const { toast } = useToast()

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
    setUploadError(null)
    setUploadSuccess(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Missing Image",
        description: "Please upload an image",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)
    setUploadError(null)
    setUploadSuccess(null)

    try {
      console.log("Starting photo upload via API...")
      const uploadedUrl = await uploadPhotoFile(file)

      if (!uploadedUrl) {
        throw new Error("Failed to get uploaded image URL")
      }

      setUploadSuccess(`Photo uploaded successfully to: ${uploadedUrl}`)
      console.log("Photo uploaded successfully:", uploadedUrl)

      onSubmit({
        title,
        description,
        short_description: shortDescription,
        thumbnail_url: uploadedUrl,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setShortDescription("")
      removeFile()

      toast({
        title: "Success",
        description: "Photo uploaded and added successfully!",
      })
    } catch (error) {
      console.error("Error submitting form:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo"
      setUploadError(errorMessage)

      toast({
        title: "Upload Error",
        description: "Please check the error message below and try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    removeFile()
    setTitle("")
    setDescription("")
    setShortDescription("")
    setUploadError(null)
    setUploadSuccess(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Photo</DialogTitle>
          <p className="text-sm text-gray-500">Photos will be uploaded via secure API to uploads/photos/</p>
        </DialogHeader>

        {uploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <div className="space-y-2">
                <p>
                  <strong>Upload Error:</strong> {uploadError}
                </p>
                <p className="text-xs">
                  If the problem persists, please check your Supabase configuration or contact support.
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {uploadSuccess && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p>
                <strong>Upload Successful:</strong> {uploadSuccess}
              </p>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            {/* Image Upload Section */}
            <div>
              <Label>Upload Image *</Label>
              {!file ? (
                <div
                  className={`mt-2 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your image here</p>
                    <p className="text-sm text-gray-500">or</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("file-input")?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">PNG, JPG, GIF up to 10MB</p>
                  <p className="text-xs text-gray-400">Will be uploaded via secure API</p>
                </div>
              ) : (
                <div className="mt-2 relative">
                  <div className="relative rounded-lg overflow-hidden bg-gray-100">
                    <img src={previewUrl || ""} alt="Preview" className="w-full h-48 object-cover" />
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
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  <p className="text-xs text-gray-400">Ready for secure upload</p>
                </div>
              )}
              <input id="file-input" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
            <Button type="submit" disabled={isSubmitting || isUploading || !file}>
              {(isSubmitting || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Uploading via API..." : isSubmitting ? "Saving..." : "Add Photo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
