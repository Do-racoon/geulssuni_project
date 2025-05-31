"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import RichTextEditor from "@/components/rich-text-editor"

interface Book {
  id: string
  title: string
  author: string
  category?: string
  cover_url?: string
  pages?: number
  description?: string
  purchase_link?: string
  external_link?: string
  tags?: string[]
  is_published: boolean
  content?: string
}

interface EditBookModalProps {
  book: Book
  onClose: () => void
  onSave: (updatedBook: Book) => void
}

export default function EditBookModal({ book, onClose, onSave }: EditBookModalProps) {
  const [formData, setFormData] = useState<Book>({
    ...book,
    content: book.content || "<p>Book content goes here...</p>",
    description: book.description || "",
    cover_url: book.cover_url || "",
    purchase_link: book.purchase_link || "",
    external_link: book.external_link || "",
    tags: book.tags || [],
    pages: book.pages || 0,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "content">("details")
  const [isUploading, setIsUploading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "pages" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
    setFormData({
      ...formData,
      tags,
    })
  }

  const handleContentChange = (content: string) => {
    setFormData({
      ...formData,
      content,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // 폼 데이터 검증
    if (!formData.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    if (!formData.author?.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      console.log("EditBookModal: Submitting form data:", formData)

      // 직접 API 호출 테스트
      const response = await fetch(`/api/books/${formData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const responseText = await response.text()
      console.log("EditBookModal: API response status:", response.status)
      console.log("EditBookModal: API response text:", responseText)

      if (!response.ok) {
        let errorMessage = "Failed to update book"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch (e) {
          // JSON 파싱 실패 시 원본 텍스트 사용
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let updatedBook
      try {
        updatedBook = JSON.parse(responseText)
      } catch (e) {
        console.error("EditBookModal: Failed to parse response JSON:", e)
        throw new Error("Invalid response from server")
      }

      console.log("EditBookModal: Book updated successfully:", updatedBook)

      toast({
        title: "Success",
        description: "Book updated successfully!",
      })

      // 부모 컴포넌트의 onSave 호출
      onSave(updatedBook)
    } catch (error) {
      console.error("EditBookModal: Error updating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update book",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle image upload
  const handleImageUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsUploading(true)

      try {
        console.log("EditBookModal: Uploading image:", file.name)

        const formDataUpload = new FormData()
        formDataUpload.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const { url } = await response.json()
        console.log("EditBookModal: Image uploaded successfully:", url)

        setFormData((prev) => ({
          ...prev,
          cover_url: url,
        }))

        toast({
          title: "Image uploaded",
          description: "The cover image has been updated.",
        })
      } catch (error) {
        console.error("EditBookModal: Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }

    input.click()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Book</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "details" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Book Details
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === "content" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Book Content
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === "details" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full aspect-[3/4] bg-gray-100 relative rounded-md overflow-hidden flex items-center justify-center">
                      {formData.cover_url ? (
                        <Image
                          src={formData.cover_url || "/placeholder.svg"}
                          alt="Book cover"
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="text-gray-400 text-sm">No cover image</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Change Cover"}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <input
                        type="text"
                        id="author"
                        name="author"
                        value={formData.author || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="">Select category</option>
                        <option value="작법서">작법서</option>
                        <option value="에세이">에세이</option>
                        <option value="소설">소설</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                        Pages
                      </label>
                      <input
                        type="number"
                        id="pages"
                        name="pages"
                        value={formData.pages || ""}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="is_published" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="is_published"
                        name="is_published"
                        value={formData.is_published ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, is_published: e.target.value === "true" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="true">Published</option>
                        <option value="false">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="purchase_link" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase URL
                    </label>
                    <input
                      type="url"
                      id="purchase_link"
                      name="purchase_link"
                      value={formData.purchase_link || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/buy-book"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="external_link" className="block text-sm font-medium text-gray-700 mb-1">
                      External Link
                    </label>
                    <input
                      type="url"
                      id="external_link"
                      name="external_link"
                      value={formData.external_link || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/external-link"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={formData.tags ? formData.tags.join(", ") : ""}
                      onChange={handleTagsChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="글쓰기, 작법, 문학"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Book Content</label>
                <div className="border border-gray-300 rounded-md">
                  <RichTextEditor initialContent={formData.content || ""} onChange={handleContentChange} />
                </div>
              </div>
            </div>
          )}

          <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
