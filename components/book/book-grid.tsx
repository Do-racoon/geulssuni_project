"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import BookCard from "./book-card"
import { type Book, books } from "@/data/books"

type Category = "all" | "writing-guides" | "essays" | "novels"

export default function BookGrid() {
  const [category, setCategory] = useState<Category>("all")
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(books)

  const handleCategoryChange = (newCategory: Category) => {
    setCategory(newCategory)

    if (newCategory === "all") {
      setFilteredBooks(books)
    } else {
      setFilteredBooks(books.filter((book) => book.category === newCategory))
    }
  }

  return (
    <div>
      <div className="flex justify-center mb-12">
        <div className="inline-flex border border-black">
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
              category === "all" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => handleCategoryChange("all")}
          >
            All
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
              category === "writing-guides" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => handleCategoryChange("writing-guides")}
          >
            Writing Guides
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
              category === "essays" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => handleCategoryChange("essays")}
          >
            Essays
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors ${
              category === "novels" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => handleCategoryChange("novels")}
          >
            Novels
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredBooks.map((book, index) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <BookCard book={book} />
          </motion.div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books found in this category.</p>
        </div>
      )}
    </div>
  )
}
