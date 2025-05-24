import type { Metadata } from "next"
import BookGrid from "@/components/book/book-grid"

export const metadata: Metadata = {
  title: "Books | Creative Agency",
  description: "Explore our curated collection of books across various genres",
}

export default function BooksPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-16 tracking-widest uppercase">Books</h1>
        <BookGrid />
      </div>
    </main>
  )
}
