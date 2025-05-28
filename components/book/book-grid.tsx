"use client"

import type { Book } from "@/lib/api/books"
import Image from "next/image"
import Link from "next/link"
import { Eye } from "lucide-react"

interface BookGridProps {
  books: Book[]
}

export default function BookGrid({ books }: BookGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.id}`} className="group block">
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            {/* Book Cover */}
            <div className="aspect-[3/4] relative overflow-hidden bg-gray-100">
              {book.cover_url ? (
                <Image
                  src={book.cover_url || "/placeholder.svg"}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center p-4">
                    <div className="text-2xl font-light text-gray-400 mb-2">📚</div>
                    <div className="text-sm text-gray-500 font-medium">{book.title}</div>
                  </div>
                </div>
              )}

              {/* Views Badge */}
              {book.views > 0 && (
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {book.views.toLocaleString()}
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-1 line-clamp-2 group-hover:text-black transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{book.author}</p>

              {book.category && (
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {book.category}
                </span>
              )}

              {book.description && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{book.description}</p>}

              {book.pages && <p className="text-xs text-gray-400 mt-2">{book.pages} pages</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
