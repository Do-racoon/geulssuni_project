"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import type { FAQ } from "@/data/faq-data"

// This component would only be shown to admin users
export default function AdminFaq() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [newQuestion, setNewQuestion] = useState("")
  const [newAnswer, setNewAnswer] = useState("")
  const [newCategory, setNewCategory] = useState<"payment" | "author" | "technical" | "general">("general")

  const handleAddFaq = () => {
    if (newQuestion.trim() === "" || newAnswer.trim() === "") return

    const newFaq: FAQ = {
      id: `faq-${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
    }

    setFaqs([...faqs, newFaq])
    setNewQuestion("")
    setNewAnswer("")
  }

  const handleDeleteFaq = (id: string) => {
    setFaqs(faqs.filter((faq) => faq.id !== id))
  }

  return (
    <div className="mt-16 border-t border-gray-200 pt-12">
      <h2 className="text-2xl font-light mb-8 tracking-wider">Admin: Manage FAQs</h2>

      <div className="mb-8">
        <h3 className="text-lg font-light mb-4">Add New FAQ</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as any)}
              className="w-full border border-gray-200 p-2 focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="payment">Payment</option>
              <option value="author">Author</option>
              <option value="technical">Technical</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              id="question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter question"
            />
          </div>
          <div>
            <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              id="answer"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              className="w-full border border-gray-200 p-3 min-h-[100px] focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter answer"
            ></textarea>
          </div>
          <button onClick={handleAddFaq} className="flex items-center px-4 py-2 bg-black text-white text-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </button>
        </div>
      </div>

      {faqs.length > 0 && (
        <div>
          <h3 className="text-lg font-light mb-4">Manage FAQs</h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="flex justify-between items-center p-4 border border-gray-200">
                <div>
                  <div className="font-medium">{faq.question}</div>
                  <div className="text-sm text-gray-500">Category: {faq.category}</div>
                </div>
                <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
