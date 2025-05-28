"use client"

import { Suspense } from "react"
import BookGrid from "@/components/book/book-grid"
import { getBooks } from "@/lib/api/books"

async function BooksContent() {
  try {
    const books = await getBooks()

    if (!books || books.length === 0) {
      return (
        <div className="min-h-screen bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-light tracking-wider mb-8">BOOKS</h1>
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 mb-4">아직 등록된 책이 없습니다.</p>
                <p className="text-sm text-gray-400">글쓰니니가 책을 추가하면 여기에 표시됩니다.</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light tracking-wider mb-4">BOOKS</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">글쓰기에 관한 소중한 도서들을 만나보세요</p>
          </div>
          <BookGrid books={books} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error loading books:", error)
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-wider mb-8">BOOKS</h1>
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 mb-4">책을 불러오는 중 오류가 발생했습니다.</p>
              <p className="text-sm text-gray-400 mb-6">
                {error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
              >
                페이지 새로고침
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default function BooksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-light tracking-wider mb-8">BOOKS</h1>
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-500">책을 불러오는 중...</span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <BooksContent />
    </Suspense>
  )
}
