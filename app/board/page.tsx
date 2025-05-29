import type { Metadata } from "next"
import { Suspense } from "react"
import BoardTabs from "@/components/board/board-tabs"

export const metadata: Metadata = {
  title: "Community Board | Creative Agency",
  description: "Share ideas and interact with our creative community",
}

function BoardContent() {
  return <BoardTabs defaultTab="free" />
}

export default function BoardPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-16 tracking-widest uppercase">Community Board</h1>
        <Suspense fallback={<div className="flex justify-center items-center h-64">Loading...</div>}>
          <BoardContent />
        </Suspense>
      </div>
    </main>
  )
}
