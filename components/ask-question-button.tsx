"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AskQuestionButtonProps {
  contactUrl?: string
  kakaoOpenChatUrl?: string
}

export default function AskQuestionButton({
  contactUrl,
  kakaoOpenChatUrl = "https://open.kakao.com/o/your-openchat-link",
}: AskQuestionButtonProps) {
  const handleContact = () => {
    if (contactUrl) {
      window.open(contactUrl, "_blank", "noopener,noreferrer")
    } else {
      // 기본 카카오톡 오픈채팅으로 이동
      window.open(kakaoOpenChatUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-medium mb-2">강의에 대해 궁금한 점이 있으신가요?</h3>
        <p className="text-gray-600 text-sm">언제든지 문의해 주세요. 빠른 답변을 드리겠습니다.</p>
      </div>

      <Button
        onClick={handleContact}
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium px-6 py-3 rounded-lg transition-colors"
      >
        <MessageCircle className="mr-2 h-4 w-4" />
        카카오톡으로 문의하기
      </Button>

      <p className="text-xs text-gray-500 text-center">클릭하시면 카카오톡 오픈채팅으로 이동합니다</p>
    </div>
  )
}
