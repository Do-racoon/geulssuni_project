"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, BookOpen, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  cover_url: string
  views: number
  pages: number
}

interface Lecture {
  id: string
  title: string
  instructor: string
  thumbnail_url: string
  views: number
  duration: number
}

export default function PopularContent() {
  const [books, setBooks] = useState<Book[]>([])
  const [lectures, setLectures] = useState<Lecture[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPopularContent()
  }, [])

  const fetchPopularContent = async () => {
    try {
      // 인기 책 상위 3개 가져오기 (실제 컬럼명: cover_url)
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("id, title, author, cover_url, views, pages")
        .eq("is_published", true)
        .order("views", { ascending: false })
        .limit(3)

      if (booksError) {
        console.error("Error fetching books:", booksError)
      } else {
        setBooks(booksData || [])
      }

      // 인기 강의 상위 3개 가져오기 (실제 컬럼명: thumbnail_url)
      const { data: lecturesData, error: lecturesError } = await supabase
        .from("lectures")
        .select(`
          id, 
          title, 
          thumbnail_url, 
          views, 
          duration,
          instructor
        `)
        .order("views", { ascending: false })
        .limit(3)

      if (lecturesError) {
        console.error("Error fetching lectures:", lecturesError)
      } else {
        const formattedLectures =
          lecturesData?.map((lecture) => ({
            ...lecture,
            instructor: lecture.instructor || "Unknown Instructor",
          })) || []
        setLectures(formattedLectures)
      }
    } catch (error) {
      console.error("Error fetching popular content:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto">
          <h2 className="text-3xl font-light text-center mb-12 tracking-widest uppercase">Popular Content</h2>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center mb-12 tracking-widest uppercase">Popular Content</h2>

        {/* 인기 강의 섹션 */}
        <div className="mb-16">
          <h3 className="text-2xl font-light mb-8 tracking-wider">Popular Lectures</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {lectures.map((lecture, index) => (
              <motion.div
                key={lecture.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 shadow-sm card-hover"
              >
                <Link href={`/lectures/${lecture.id}`} className="block">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={lecture.thumbnail_url || "/placeholder.svg?height=240&width=400&text=Lecture"}
                      alt={lecture.title}
                      fill
                      className="object-cover monochrome"
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 text-xs uppercase tracking-widest">
                      Lecture
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-light tracking-wider mb-2 line-clamp-2">{lecture.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">by {lecture.instructor}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{lecture.views?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{lecture.duration || 0} min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* 인기 책 섹션 */}
        <div>
          <h3 className="text-2xl font-light mb-8 tracking-wider">Popular Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 shadow-sm card-hover"
              >
                <Link href={`/books/${book.id}`} className="block">
                  <div className="relative w-full h-48 overflow-hidden">
                    <Image
                      src={book.cover_url || "/placeholder.svg?height=240&width=400&text=Book"}
                      alt={book.title}
                      fill
                      className="object-cover monochrome"
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 text-xs uppercase tracking-widest">
                      Book
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-light tracking-wider mb-2 line-clamp-2">{book.title}</h4>
                    <p className="text-sm text-gray-600 mb-4">by {book.author}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{book.views?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{book.pages || 0} pages</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
