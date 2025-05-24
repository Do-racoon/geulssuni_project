"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"

interface AddFreeBoardPostModalProps {
  onClose: () => void
}

export default function AddFreeBoardPostModal({ onClose }: AddFreeBoardPostModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [richContent, setRichContent] = useState("")
  const [category, setCategory] = useState("design")
  const [isPinned, setIsPinned] = useState(false)
  const [useRichEditor, setUseRichEditor] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to create the post
    console.log({
      title,
      content: useRichEditor ? richContent : content,
      category,
      isPinned,
      author: {
        id: "admin-1",
        name: "Admin",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
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
                <option value="writing">Writing</option>
                <option value="design">Design</option>
                <option value="photography">Photography</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  Content
                </label>
                <div className="flex items-center">
                  <label className="text-sm text-gray-600 mr-2">Use rich editor</label>
                  <input
                    type="checkbox"
                    checked={useRichEditor}
                    onChange={() => setUseRichEditor(!useRichEditor)}
                    className="rounded border-gray-300 text-black focus:ring-black"
                  />
                </div>
              </div>

              {useRichEditor ? (
                <RichTextEditor initialContent={richContent} onChange={setRichContent} />
              ) : (
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required={!useRichEditor}
                />
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPinned"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label htmlFor="isPinned" className="ml-2 block text-sm text-gray-700">
                Pin this post
              </label>
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
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
