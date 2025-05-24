import Image from "next/image"
import Link from "next/link"
import type { Book } from "@/data/books"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface BookCardProps {
  book: Book
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white h-full content-card">
      <Link href={`/books/${book.id}`} className="block group">
        <div className="content-card-image">
          <Image
            src={book.cover || "/placeholder.svg"}
            alt={book.title}
            fill
            className="object-cover monochrome"
            style={{ objectPosition: "center" }}
          />
        </div>
      </Link>
      <div className="content-card-body">
        <Link href={`/books/${book.id}`} className="block group">
          <h3 className="content-card-title group-hover:underline">{book.title}</h3>
          <p className="content-card-author">by {book.author}</p>
        </Link>

        <div className="flex-grow"></div>

        <div className="content-card-actions mt-4">
          {book.purchaseUrl && (
            <a href={book.purchaseUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-black hover:bg-black hover:text-white transition-colors"
              >
                Buy <ExternalLink className="ml-1 h-3 w-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
