"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"

interface AddPortfolioModalProps {
  onClose: () => void
}

export default function AddPortfolioModal({ onClose }: AddPortfolioModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Editorial")
  const [creator, setCreator] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState("published")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to create the portfolio item
    console.log({
      title,
      category,
      creator,
      description,
      image,
      featured,
      status,
      createdAt: new Date().toISOString(),
    })

    // Close the modal
    onClose()
  }

  // Simulate image upload
  const handleImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For demo purposes, we'll just set a placeholder image
    setImage("/placeholder.svg?height=600&width=800")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New Portfolio Item</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio Image</label>
              <div className="w-full aspect-video bg-gray-100 relative rounded-md overflow-hidden flex items-center justify-center">
                {image ? (
                  <Image src={image || "/placeholder.svg"} alt="Portfolio" fill className="object-cover" />
                ) : (
                  <div className="text-gray-400 text-sm text-center p-4">No image uploaded</div>
                )}
              </div>
              <button
                type="button"
                onClick={handleImageUpload}
                className="mt-2 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Image
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
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="Editorial">Editorial</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Abstract">Abstract</option>
                  <option value="Branding">Branding</option>
                  <option value="Packaging">Packaging</option>
                </select>
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
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
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
                  onChange={(e) => setStatus(e.target.value)}
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Add Portfolio Item
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
