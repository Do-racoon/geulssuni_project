import type { Metadata } from "next"
import LectureGrid from "@/components/lecture/lecture-grid"

export const metadata: Metadata = {
  title: "Lectures | Creative Agency",
  description: "Explore our curated collection of lectures across various skill levels and topics",
}

export default function LecturesPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-16 tracking-widest uppercase">Lectures</h1>
        <LectureGrid />
      </div>
    </main>
  )
}
