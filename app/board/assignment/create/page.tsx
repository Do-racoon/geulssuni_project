import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import AssignmentEditor from "@/components/board/assignment-editor"

export const metadata: Metadata = {
  title: "과제 등록 | 과제게시판",
  description: "과제게시판에 새 과제를 등록합니다",
}

export default function CreateAssignmentPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto py-12 px-4">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/board"
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          게시판으로 돌아가기
        </Link>

        {/* 에디터 카드 */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <AssignmentEditor />
        </div>
      </div>
    </main>
  )
}
