"use client"

import Link from "next/link"
import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ImageIcon, Smile } from "lucide-react"
import EmojiPicker from "./emoji-picker"
import RichTextEditor from "@/components/rich-text-editor"

export default function PostEditor() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [richContent, setRichContent] = useState("")
  const [category, setCategory] = useState<"general" | "sharing" | "open">("general")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [useRichEditor, setUseRichEditor] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would be an API call to create the post
    console.log({
      title,
      content: useRichEditor ? richContent : content,
      category,
      imageUrl,
    })

    // Redirect to the board page
    router.push("/board")
  }

  const insertEmoji = (emoji: string) => {
    if (useRichEditor) {
      setRichContent(richContent + emoji)
    } else {
      setContent(content + emoji)
    }
    setShowEmojiPicker(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value as "general" | "sharing" | "open")}
          className="w-full border border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="general">General</option>
          <option value="sharing">Sharing</option>
          <option value="open">Open Topics</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
          placeholder="Enter post title"
          required
        />
      </div>

      <div className="mb-6">
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
          <div className="mb-2">
            <RichTextEditor initialContent={richContent} onChange={setRichContent} />
          </div>
        ) : (
          <div className="border border-gray-200 mb-2">
            <div className="flex items-center border-b border-gray-200 p-2 bg-gray-50">
              <div className="relative ml-auto">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Emoji"
                >
                  <Smile className="h-4 w-4" />
                </button>
                {showEmojiPicker && <EmojiPicker onSelect={insertEmoji} />}
              </div>
            </div>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-3 min-h-[200px] focus:outline-none"
              placeholder="Write your post content here... Markdown is supported."
              required={!useRichEditor}
            ></textarea>
          </div>
        )}
        <p className="text-xs text-gray-500">
          {useRichEditor ? "Rich text formatting is supported." : "Markdown formatting is supported."}
        </p>
      </div>

      <div className="mb-8">
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Image (optional)
        </label>
        <div className="flex items-center">
          <input
            type="text"
            id="image"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="flex-grow border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Enter image URL"
          />
          <button
            type="button"
            className="ml-2 flex items-center px-4 py-3 border border-gray-200 bg-gray-50 hover:bg-gray-100"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Upload
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/board"
          className="px-6 py-2 border border-gray-200 text-gray-700 mr-2 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <button type="submit" className="px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors">
          Publish Post
        </button>
      </div>
    </form>
  )
}
