"use client"

import type React from "react"
import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RichTextEditor from "@/components/rich-text-editor"
import { toast } from "@/hooks/use-toast"

interface AddBookModalProps {
  onClose: () => void
  onSave: (bookData: any) => void
}

export default function AddBookModal({ onClose, onSave }: AddBookModalProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("작법서")
  const [pages, setPages] = useState("")
  const [description, setDescription] = useState("")
  const [richContent, setRichContent] = useState("")
  const [coverImage, setCoverImage] = useState("")
  const [status, setStatus] = useState("published")
  const [activeTab, setActiveTab] = useState("details")
  const [purchaseUrl, setPurchaseUrl] = useState("")
  const [externalLink, setExternalLink] = useState("")
  const [tags, setTags] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 폼 데이터 검증
    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      })
      return
    }

    if (!author.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required",
        variant: "destructive",
      })
      return
    }

    const bookData = {
      title,
      author,
      category,
      pages: pages ? Number.parseInt(pages) : 0,
      description,
      content: richContent,
      cover_url: coverImage,
      is_published: status === "published",
      purchase_link: purchaseUrl,
      external_link: externalLink,
      tags: tags
        ? tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
    }

    console.log("AddBookModal: Submitting book data:", bookData)

    try {
      // 직접 API 호출 테스트
      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      const responseText = await response.text()
      console.log("AddBookModal: API response status:", response.status)
      console.log("AddBookModal: API response text:", responseText)

      if (!response.ok) {
        let errorMessage = "Failed to create book"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.details || errorData.error || errorMessage
        } catch (e) {
          // JSON 파싱 실패 시 원본 텍스트 사용
          errorMessage = responseText || errorMessage
        }
        throw new Error(errorMessage)
      }

      let newBook
      try {
        newBook = JSON.parse(responseText)
      } catch (e) {
        console.error("AddBookModal: Failed to parse response JSON:", e)
        throw new Error("Invalid response from server")
      }

      console.log("AddBookModal: Book created successfully:", newBook)

      toast({
        title: "Success",
        description: "Book created successfully!",
      })

      // 부모 컴포넌트의 onSave 호출
      onSave(newBook)
    } catch (error) {
      console.error("AddBookModal: Error creating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create book",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = async () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", "books")

        // Supabase 업로드 사용 (더 안정적)
        const response = await fetch("/api/upload-supabase", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Upload failed")
        }

        const { url } = await response.json()
        setCoverImage(url)

        toast({
          title: "Success",
          description: "Cover image uploaded successfully!",
        })
      } catch (error) {
        console.error("Error uploading image:", error)
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload image",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    }

    input.click()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New Book</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Book Details</TabsTrigger>
              <TabsTrigger value="content">Book Content</TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="p-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full aspect-[3/4] bg-gray-100 relative rounded-md overflow-hidden flex items-center justify-center">
                      {coverImage ? (
                        <Image src={coverImage || "/placeholder.svg"} alt="Book cover" fill className="object-cover" />
                      ) : (
                        <div className="text-gray-400 text-sm text-center p-4">No cover image</div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Cover"}
                    </button>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                        Author *
                      </label>
                      <input
                        type="text"
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
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
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
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
                      <label htmlFor="pages" className="block text-sm font-medium text-gray-700 mb-1">
                        Pages
                      </label>
                      <input
                        type="number"
                        id="pages"
                        value={pages}
                        onChange={(e) => setPages(e.target.value)}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="purchaseUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Purchase URL
                    </label>
                    <input
                      type="url"
                      id="purchaseUrl"
                      value={purchaseUrl}
                      onChange={(e) => setPurchaseUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="https://example.com/buy-book"
                    />
                  </div>

                  <div>
                    <label htmlFor="externalLink" className="block text-sm font-medium text-gray-700 mb-1">
                      External Link
                    </label>
                    <input
                      type="url"
                      id="externalLink"
                      value={externalLink}
                      onChange={(e) => setExternalLink(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="https://example.com/external-link"
                    />
                  </div>

                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      id="tags"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="design, creativity, visual arts"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Short Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="p-6 pt-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Book Content</label>
                  <RichTextEditor initialContent={richContent} onChange={setRichContent} />
                </div>
              </div>
            </TabsContent>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
              >
                Add Book
              </button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}
