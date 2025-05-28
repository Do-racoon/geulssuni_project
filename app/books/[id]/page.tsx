import { notFound } from "next/navigation"
import { getBook, getBooksByTags, incrementBookViews } from "@/lib/api/books"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, Calendar, BookOpen, ExternalLink, Tag } from "lucide-react"

interface BookPageProps {
  params: {
    id: string
  }
}

async function fetchBook(id: string) {
  try {
    const book = await getBook(id)

    // Increment views (don't await to avoid blocking)
    incrementBookViews(id).catch(console.error)

    return book
  } catch (error) {
    console.error("Error fetching book:", error)
    return null
  }
}

async function fetchRelatedBooks(book: any) {
  if (!book.tags || book.tags.length === 0) {
    return []
  }

  try {
    return await getBooksByTags(book.tags, book.id, 6)
  } catch (error) {
    console.error("Error fetching related books:", error)
    return []
  }
}

export default async function BookPage({ params }: BookPageProps) {
  const book = await fetchBook(params.id)

  if (!book) {
    notFound()
  }

  const relatedBooks = await fetchRelatedBooks(book)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/books"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Books
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Book Cover */}
          <div className="aspect-[3/4] relative overflow-hidden rounded-lg bg-gray-100">
            {book.cover_url ? (
              <Image
                src={book.cover_url || "/placeholder.svg"}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-xl text-gray-500 font-medium">{book.title}</div>
                </div>
              </div>
            )}
          </div>

          {/* Book Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              {book.category && (
                <span className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full mb-4">
                  {book.category}
                </span>
              )}

              <h1 className="text-4xl font-light tracking-wide mb-4">{book.title}</h1>
              <p className="text-xl text-gray-600 mb-6">by {book.author}</p>
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-500">Tags</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {book.tags.map((tag, index) => (
                    <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="flex items-center gap-6 mb-8 text-sm text-gray-500">
              {book.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {book.views.toLocaleString()} views
                </div>
              )}

              {book.pages && (
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {book.pages} pages
                </div>
              )}

              {book.created_at && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(book.created_at).getFullYear()}
                </div>
              )}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">About this book</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{book.description}</p>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-auto">
              {book.purchase_link ? (
                <a
                  href={book.purchase_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Read Preview
                  <ExternalLink className="w-4 h-4" />
                </a>
              ) : (
                <button disabled className="bg-gray-300 text-gray-500 px-8 py-3 rounded-md cursor-not-allowed">
                  Preview Not Available
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Related Books Section */}
        {relatedBooks.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-light tracking-wide mb-8">More books with similar tags</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {relatedBooks.map((relatedBook) => (
                <Link key={relatedBook.id} href={`/books/${relatedBook.id}`} className="group">
                  <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {relatedBook.cover_url ? (
                        <Image
                          src={relatedBook.cover_url || "/placeholder.svg"}
                          alt={relatedBook.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                          <div className="text-center p-6">
                            <div className="text-4xl mb-3">📚</div>
                            <div className="text-sm text-gray-500 font-medium line-clamp-3">{relatedBook.title}</div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors">
                        {relatedBook.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{relatedBook.author}</p>
                      <div className="flex items-center justify-between">
                        {relatedBook.category && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {relatedBook.category}
                          </span>
                        )}
                        {relatedBook.views > 0 && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {relatedBook.views.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No Related Books */}
        {relatedBooks.length === 0 && book.tags && book.tags.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-light tracking-wide mb-8">More books with similar tags</h2>
            <div className="text-center py-12 text-gray-500">
              <p>No related books found with similar tags</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BookPageProps) {
  const book = await fetchBook(params.id)

  if (!book) {
    return {
      title: "Book Not Found",
    }
  }

  return {
    title: `${book.title} by ${book.author}`,
    description: book.description || `Read ${book.title} by ${book.author}`,
  }
}
