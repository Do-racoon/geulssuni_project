"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface Portfolio {
  id: string
  title: string
  category: string
  short_description: string
  thumbnail_url: string
  link: string
  creator: string
  featured: boolean
  status: "published" | "draft"
  created_at: string
}

interface EditPortfolioModalProps {
  portfolio: Portfolio
  onClose: () => void
  onSave: (updatedPortfolio: Portfolio) => void
}

export default function EditPortfolioModal({ portfolio, onClose, onSave }: EditPortfolioModalProps) {
  const [title, setTitle] = useState(portfolio.title)
  const [category, setCategory] = useState(portfolio.category)
  const [creator, setCreator] = useState(portfolio.creator)
  const [shortDescription, setShortDescription] = useState(portfolio.short_description)
  const [thumbnailUrl, setThumbnailUrl] = useState(portfolio.thumbnail_url)
  const [link, setLink] = useState(portfolio.link)
  const [featured, setFeatured] = useState(portfolio.featured)
  const [status, setStatus] = useState(portfolio.status)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const updatedPortfolio: Portfolio = {
        ...portfolio,
        title,
        category,
        creator,
        short_description: shortDescription,
        thumbnail_url: thumbnailUrl,
        link,
        featured,
        status,
      }

      await onSave(updatedPortfolio)
      onClose()
    } catch (error) {
      console.error("Error updating portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to update portfolio item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 썸네일 업로드 함수
  const handleThumbnailUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // 파일명을 안전하게 변환하는 함수
        const sanitizeFilename = (filename: string): string => {
          const lastDotIndex = filename.lastIndexOf(".")
          const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
          const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : ""

          const safeName = name
            .replace(/[^a-zA-Z0-9\-_.]/g, "_")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "")

          return (safeName + extension).toLowerCase()
        }

        const sanitizedFilename = sanitizeFilename(file.name)
        const timestamp = Date.now()
        const safePath = `portfolio/thumbnail/${timestamp}-${sanitizedFilename}`

        const formData = new FormData()
        formData.append("file", file)
        formData.append("bucket", "uploads")
        formData.append("path", safePath)
        formData.append("entity_type", "portfolio")
        formData.append("entity_id", portfolio.id)

        const response = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          setThumbnailUrl(result.publicUrl)

          toast({
            title: "Image uploaded",
            description: "Thumbnail image has been uploaded successfully.",
          })
        } else {
          throw new Error(result.error || "Upload failed")
        }
      } catch (error) {
        console.error("Image upload error:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }

    input.click()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Portfolio Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* 썸네일 이미지 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail Image</label>
              <div className="w-full aspect-video bg-gray-100 relative rounded-md overflow-hidden flex items-center justify-center">
                {thumbnailUrl ? (
                  <Image src={thumbnailUrl || "/placeholder.svg"} alt="Thumbnail" fill className="object-cover" />
                ) : (
                  <div className="text-gray-400 text-sm text-center p-4">No thumbnail uploaded</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleThumbnailUpload}
                className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Thumbnail
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="e.g., Web Design, Photography, Branding"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-1">
                Creator
              </label>
              <input
                type="text"
                id="creator"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="Enter a brief description of this portfolio item..."
                required
              />
            </div>

            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
                External Link
              </label>
              <input
                type="url"
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="https://example.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "published" | "draft")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Item
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
