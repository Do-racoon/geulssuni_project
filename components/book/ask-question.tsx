"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  const [kakaoLink, setKakaoLink] = useState("")

  useEffect(() => {
    // 카카오톡 문의 링크 가져오기
    const loadKakaoLink = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          setKakaoLink(data.settings?.kakao_inquiry_link || "")
        }
      } catch (error) {
        console.error("Error loading kakao link:", error)
      }
    }
    loadKakaoLink()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("Question submitted:", { bookId, question })

    setIsSubmitting(false)
    setIsSubmitted(true)
    setQuestion("")

    setTimeout(() => {
      setIsSubmitted(false)
      setIsOpen(false)
    }, 3000)
  }

  const handleKakaoInquiry = () => {
    if (kakaoLink && kakaoLink.trim() !== "") {
      window.open(kakaoLink, "_blank")
    } else {
      alert("카카오톡 문의 링크가 설정되지 않았습니다.")
    }
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex gap-2">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            variant="outline"
            className="border-black hover:bg-black hover:text-white transition-colors"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask a Question
          </Button>
        ) : null}

        <Button onClick={handleKakaoInquiry} className="bg-yellow-400 text-black hover:bg-yellow-500 transition-colors">
          💬 카카오톡 문의
        </Button>
      </div>

      {isOpen && (
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
