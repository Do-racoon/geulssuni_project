import { Suspense } from "react"
import LectureGrid from "@/components/lecture/lecture-grid"
import { getLectures } from "@/lib/api/lectures"

async function LecturesContent() {
  try {
    const lectures = await getLectures()

    if (!lectures || lectures.length === 0) {
      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-light tracking-wider mb-8">LECTURES</h1>
              <p className="text-gray-500 mb-8">강의가 아직 등록되지 않았습니다.</p>
              <p className="text-sm text-gray-400">관리자가 강의를 추가하면 여기에 표시됩니다.</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <h1 className="text-4xl font-light tracking-wider text-center mb-16">LECTURES</h1>
          <LectureGrid lectures={lectures} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading lectures:", error)
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-wider mb-8">LECTURES</h1>
            <p className="text-red-500 mb-4">강의를 불러오는 중 오류가 발생했습니다.</p>
            <p className="text-sm text-gray-400">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </div>
    )
  }
}

export default function LecturesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-light tracking-wider mb-8">LECTURES</h1>
              <p className="text-gray-500">강의를 불러오는 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <LecturesContent />
    </Suspense>
  )
}
