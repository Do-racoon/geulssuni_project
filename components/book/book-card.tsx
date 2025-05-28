"use client"

import type React from "react"
import Image from "next/image"
import { incrementBookSales } from "@/lib/api/books"

interface BookCardProps {
  book: any
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const handlePurchaseClick = async (book: any) => {
    try {
      await incrementBookSales(book.id)
      if (book.external_link) {
        window.open(book.external_link, "_blank")
      } else if (book.purchase_link) {
        window.open(book.purchase_link, "_blank")
      }
    } catch (error) {
      console.error("Error tracking purchase:", error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-64">
        <Image src={book.image_url || "/placeholder.svg"} alt={book.title} layout="fill" objectFit="cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
        <p className="text-gray-700 text-sm">{book.description}</p>
        <button
          onClick={() => handlePurchaseClick(book)}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors mt-4"
        >
          구매하기
        </button>
        <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
          <span>{book.views || 0} views</span>
          <span>{book.sales_count || 0} sales</span>
        </div>
      </div>
    </div>
  )
}

export default BookCard
