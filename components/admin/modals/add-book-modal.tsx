"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import RichTextEditor from "@/components/rich-text-editor"

interface AddBookModalProps {
  onClose: () => void
}

export default function AddBookModal({ onClose }: AddBookModalProps) {
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [category, setCategory] = useState("Design")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [richContent, setRichContent] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [status, setStatus] = useState("published")
  const [activeTab, setActiveTab] = useState("details")
  const [purchaseUrl, setPurchaseUrl] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to create the book
    console.log({
      title,
      author,
      category,
      price: Number.parseFloat(price),
      description,
      content: richContent,
      publishDate,
      coverImage,
      status,
      purchaseUrl,
      createdAt: new Date().toISOString(),
    })

    // Close the modal
    onClose()
  }

  // Simulate image upload
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For demo purposes, we'll just set a placeholder image
    setCoverImage("/placeholder.svg?height=400&width=300")
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
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover
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
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($)
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
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
                        value={publishDate}
                        onChange={(e) => setPublishDate(e.target.value)}
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
                      value={purchaseUrl}
                      onChange={(e) => setPurchaseUrl(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="https://example.com/buy-book"
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
                      required
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
