"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import RichTextEditor from "@/components/rich-text-editor"
import { getInstructors } from "@/lib/api/instructors"

interface Book {
  id: string
  title: string
  author: string
  category: string
  image: string
  publishDate: string
  price: number
  sales: number
  status: string
  description?: string
  content?: string
  purchaseUrl?: string
}

interface EditBookModalProps {
  book: Book
  onClose: () => void
  onSave: (updatedBook: Book) => void
}

export default function EditBookModal({ book, onClose, onSave }: EditBookModalProps) {
  const [instructors, setInstructors] = useState<any[]>([])
  const [formData, setFormData] = useState<Book>({
    ...book,
    content: book.content || "<p>Book content goes here...</p>",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"details" | "content">("details")

  useEffect(() => {
    const loadInstructors = async () => {
      try {
        const data = await getInstructors()
        setInstructors(data)
      } catch (error) {
        console.error("Error loading instructors:", error)
      }
    }
    loadInstructors()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "price" ? Number.parseFloat(value) : value,
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

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onSave(formData)
      toast({
        title: "Book updated",
        description: "The book has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update book. Please try again.",
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

      try {
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

        setFormData((prev) => ({
          ...prev,
          image: url,
        }))

        toast({
          title: "Image uploaded",
          description: "The cover image has been updated.",
        })
      } catch (error) {
        console.error("Error uploading image:", error)
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
                      {formData.image ? (
                        <Image
                          src={formData.image || "/placeholder.svg"}
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
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Change Cover
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
                      value={formData.title}
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
                      <select
                        id="author"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      >
                        <option value="">Select an author</option>
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.name}>
                            {instructor.name} - {instructor.profession}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="작법서">작법서</option>
                        <option value="에세이">에세이</option>
                        <option value="소설">소설</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Publish Date
                      </label>
                      <input
                        type="date"
                        id="publishDate"
                        name="publishDate"
                        value={formData.publishDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="purchaseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase URL
                    </label>
                    <input
                      type="url"
                      id="purchaseUrl"
                      name="purchaseUrl"
                      value={formData.purchaseUrl || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/buy-book"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
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

                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
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
