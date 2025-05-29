"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Eye, BookOpen, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface PopularContentItem {
  id: string
  content_type: "lecture" | "book"
  content_id: string
  title: string
  author: string
  thumbnail_url: string
  views: number
  engagement: number
  duration_minutes: number
  pages: number
  featured: boolean
}

type ContentType = "lecture" | "book"

interface ContentItem {
  id: number
  type: ContentType
  title: string
  author: string
  thumbnail: string
  views: number
  engagement: number
  duration: string
  featured: boolean
}

// Sample data - in a real application, this would come from an API
const contentItemsOriginal: ContentItem[] = [
  {
    id: 1,
    type: "lecture",
    title: "The Art of Minimalism",
    author: "Alexandra Reeves",
    thumbnail: "/images/lecture-1.jpg",
    views: 12450,
    engagement: 89,
    duration: "45 min",
    featured: true,
  },
  {
    id: 2,
    type: "book",
    title: "Design Principles",
    author: "Thomas Noir",
    thumbnail: "/images/book-1.jpg",
    views: 9870,
    engagement: 92,
    duration: "320 pages",
    featured: true,
  },
  {
    id: 3,
    type: "lecture",
    title: "Creative Direction",
    author: "Elise Laurent",
    thumbnail: "/images/lecture-2.jpg",
    views: 8540,
    engagement: 78,
    duration: "60 min",
    featured: false,
  },
  {
    id: 4,
    type: "book",
    title: "Modern Typography",
    author: "Marcus Chen",
    thumbnail: "/images/book-2.jpg",
    views: 7650,
    engagement: 85,
    duration: "280 pages",
    featured: false,
  },
  {
    id: 5,
    type: "lecture",
    title: "Visual Storytelling",
    author: "Alexandra Reeves",
    thumbnail: "/images/lecture-3.jpg",
    views: 6980,
    engagement: 91,
    duration: "50 min",
    featured: false,
  },
  {
    id: 6,
    type: "book",
    title: "The Essence of Form",
    author: "Thomas Noir",
    thumbnail: "/images/book-3.jpg",
    views: 5430,
    engagement: 87,
    duration: "210 pages",
    featured: false,
  },
]

export default function PopularContent() {
  const [contentItems, setContentItems] = useState<PopularContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<ContentType | "all">("all")
  const [sortedContent, setSortedContent] = useState<ContentItem[]>([])

  useEffect(() => {
    async function fetchPopularContent() {
      try {
        const { data, error } = await supabase
          .from("popular_content")
          .select("*")
          .order("views", { ascending: false })
          .order("featured", { ascending: false })

        if (error) throw error
        setContentItems(data || [])
      } catch (error) {
        console.error("Error fetching popular content:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPopularContent()
  }, [])

  // Function to get the correct detail page URL based on content type
  const getDetailPageUrl = (item: PopularContentItem) => {
    return item.content_type === "lecture" ? `/lectures/${item.content_id}` : `/books/${item.content_id}`
  }

  const filteredContent = filter === "all" ? contentItems : contentItems.filter((item) => item.content_type === filter)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center mb-6 tracking-widest uppercase">Popular Content</h2>

        <div className="flex justify-center mb-12">
          <div className="inline-flex border border-black">
            <button
              className={`px-8 py-3 text-sm uppercase tracking-widest transition-colors ${filter === "all" ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`px-8 py-3 text-sm uppercase tracking-widest transition-colors ${filter === "lecture" ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => setFilter("lecture")}
            >
              Lectures
            </button>
            <button
              className={`px-8 py-3 text-sm uppercase tracking-widest transition-colors ${filter === "book" ? "bg-black text-white" : "bg-white text-black"}`}
              onClick={() => setFilter("book")}
            >
              Books
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredContent.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white border border-gray-100 shadow-sm card-hover h-full"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: item.featured ? "auto" : "460px", // Fixed height for non-featured cards
                }}
              >
                <Link href={getDetailPageUrl(item)} className="block h-full flex flex-col">
                  <div
                    className="relative w-full overflow-hidden"
                    style={{
                      height: "240px", // Fixed height for all images
                      flexShrink: 0, // Prevent image from shrinking
                    }}
                  >
                    <Image
                      src={item.thumbnail_url || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover monochrome"
                      style={{ objectPosition: "center" }}
                    />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 text-xs uppercase tracking-widest">
                      {item.content_type}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-light tracking-wider mb-2 line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">by {item.author}</p>

                    {/* This spacer pushes the stats to the bottom */}
                    <div className="flex-grow"></div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-auto">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{item.views.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {item.content_type === "lecture" ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <BookOpen className="h-4 w-4" />
                        )}
                        <span>
                          {item.content_type === "lecture" ? `${item.duration_minutes} min` : `${item.pages} pages`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-xs">{item.engagement}% engagement</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
