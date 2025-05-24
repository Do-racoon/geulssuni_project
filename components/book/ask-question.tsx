"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageCircle, Send } from "lucide-react"

interface AskQuestionProps {
  bookId: string
}

export default function AskQuestion({ bookId }: AskQuestionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, you would send the question to your backend
    console.log("Question submitted:", { bookId, question })

    setIsSubmitting(false)
    setIsSubmitted(true)
    setQuestion("")

    // Reset after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setIsOpen(false)
    }, 3000)
  }

  return (
    <div className="mt-4">
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          className="border-black hover:bg-black hover:text-white transition-colors"
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Ask a Question
        </Button>
      ) : (
        <div className="border border-gray-200 rounded-md p-4">
          <h3 className="text-lg font-medium mb-2">Ask a Question</h3>
          <form onSubmit={handleSubmit}>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to know about this book?"
              className="min-h-[100px] mb-3"
              disabled={isSubmitting || isSubmitted}
              required
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="mr-2"
                disabled={isSubmitting || isSubmitted}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted || !question.trim()}
                className="bg-black text-white hover:bg-gray-800"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : isSubmitted ? (
                  "Submitted!"
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
