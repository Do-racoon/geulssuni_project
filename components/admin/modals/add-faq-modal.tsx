"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"
import RichTextEditor from "@/components/rich-text-editor"

interface AddFaqModalProps {
  onClose: () => void
}

export default function AddFaqModal({ onClose }: AddFaqModalProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [richAnswer, setRichAnswer] = useState("")
  const [category, setCategory] = useState("general")
  const [useRichEditor, setUseRichEditor] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to create the FAQ
    console.log({
      question,
      answer: useRichEditor ? richAnswer : answer,
      category,
      id: `faq-${Date.now()}`,
    })

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New FAQ</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
                Question
              </label>
              <input
                type="text"
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
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
                <option value="general">General</option>
                <option value="payment">Payment</option>
                <option value="author">Author</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                  Answer
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
                <RichTextEditor initialContent={richAnswer} onChange={setRichAnswer} />
              ) : (
                <textarea
                  id="answer"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required={!useRichEditor}
                />
              )}
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
              Add FAQ
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
