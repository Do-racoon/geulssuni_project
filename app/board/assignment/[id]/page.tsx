import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import AssignmentDetail from "@/components/board/assignment-detail"

interface AssignmentDetailPageProps {
  params: {
    id: string
  }
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/board"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO BOARD
          </Link>
        </div>

        {/* 과제 상세 정보 - 클라이언트 컴포넌트로 분리 */}
        <AssignmentDetail assignmentId={params.id} />
      </div>
    </main>
  )
}
