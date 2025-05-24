"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { getBook } from "@/data/books"
import { ArrowLeft, Calendar, User, BookOpen, Tag, ExternalLink } from "lucide-react"

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [book, setBook] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the book by ID
    const foundBook = getBook(params.id)

    if (foundBook) {
      setBook(foundBook)
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl mb-4">Book not found</p>
          <Button onClick={() => router.push("/books")}>Back to Books</Button>
        </div>
      </div>
    )
  }

  // Mock purchase URL - in a real app, this would come from the book data
  const purchaseUrl = book.purchaseUrl || "https://example.com/books/" + book.id

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/books")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Books
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="relative w-full max-w-[250px] aspect-[3/4]">
              <Image
                src={book.cover || "/placeholder.svg?height=300&width=200"}
                alt={book.title}
                fill
                className="object-cover rounded-md shadow-md"
              />
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">{book.title}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {book.author}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>Published: {book.publishDate}</span>
              </div>

              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-gray-500" />
                <span>{book.pages} pages</span>
              </div>

              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span>ISBN: {book.isbn}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-gray-500">Publisher:</span>
                <span>{book.publisher}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="outline">{book.category.replace("-", " ")}</Badge>
            </div>

            <Button asChild className="flex items-center gap-2">
              <a href={purchaseUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Buy the Book
              </a>
            </Button>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="prose max-w-none mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <p>{book.description}</p>
          {book.longDescription && <p className="mt-4">{book.longDescription}</p>}
        </div>
      </div>
    </div>
  )
}
