"use client"

import { Suspense, useEffect, useState } from "react"
import BookGrid from "@/components/book/book-grid"

interface Book {
  id: string
  title: string
  author: string
  description: string
  image_url: string
  price: number
  tags: string[]
  is_published: boolean
  views: number
  sales_count: number
  created_at: string
  updated_at: string
}

function BooksContent() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBooks() {
      try {
        console.log("Fetching books from API...")
        const response = await fetch("/api/books", {
          cache: "no-store",
        })

        console.log("API response status:", response.status)
        const contentType = response.headers.get("content-type")
        console.log("API response content-type:", contentType)

        if (!response.ok) {
          // If the API route doesn't exist, fall back to client-side data fetching
          if (response.status === 404) {
            console.log("API route not found, falling back to direct DB call")
            const { getBooks } = await import("@/lib/api/books")
            const data = await getBooks()
            setBooks(data || [])
            return
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        if (!contentType || !contentType.includes("application/json")) {
          console.error("Non-JSON response:", await response.text())
          throw new Error("API returned non-JSON response")
        }

        const data = await response.json()
        console.log("Books data received:", data ? data.length : 0, "items")
        setBooks(data || [])
      } catch (error) {
        console.error("Error loading books:", error)
        setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  if (loading) {
    return (
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
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-light tracking-wider mb-8">BOOKS</h1>
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">⚠️</div>
              <p className="text-red-500 mb-4">책을 불러오는 중 오류가 발생했습니다.</p>
              <p className="text-sm text-gray-400 mb-6">{error}</p>
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
