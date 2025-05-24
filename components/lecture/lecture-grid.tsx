"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import LectureCard from "./lecture-card"
import { type Lecture, lectures } from "@/data/lectures"
import { Filter, Calendar, Clock } from "lucide-react"

type Category = "all" | "beginner" | "intermediate" | "advanced" | "special"
type SortOption = "newest" | "oldest" | "duration-asc" | "duration-desc"

export default function LectureGrid() {
  const [category, setCategory] = useState<Category>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [showFilters, setShowFilters] = useState(false)
  const [filteredLectures, setFilteredLectures] = useState<Lecture[]>(lectures)

  useEffect(() => {
    let result = [...lectures]

    // Filter by category
    if (category !== "all") {
      result = result.filter((lecture) => lecture.category === category)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "duration-asc":
          return a.durationMinutes - b.durationMinutes
        case "duration-desc":
          return b.durationMinutes - a.durationMinutes
        default:
          return 0
      }
    })

    setFilteredLectures(result)
  }, [category, sortBy])

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-sm uppercase tracking-wider border border-black px-4 py-2 mr-4"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>

          <div className="hidden md:flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border-b border-gray-300 py-1 pr-8 focus:outline-none bg-transparent"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration-asc">Duration (Shortest)</option>
              <option value="duration-desc">Duration (Longest)</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-gray-500">
          Showing {filteredLectures.length} of {lectures.length} lectures
        </div>
      </div>

      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8 overflow-hidden"
        >
          <div className="border border-gray-200 p-6">
            <h3 className="text-sm uppercase tracking-wider mb-4">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <button
                onClick={() => setCategory("all")}
                className={`px-4 py-2 text-sm transition-colors ${
                  category === "all" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategory("beginner")}
                className={`px-4 py-2 text-sm transition-colors ${
                  category === "beginner" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => setCategory("intermediate")}
                className={`px-4 py-2 text-sm transition-colors ${
                  category === "intermediate" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => setCategory("advanced")}
                className={`px-4 py-2 text-sm transition-colors ${
                  category === "advanced" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                }`}
              >
                Advanced
              </button>
              <button
                onClick={() => setCategory("special")}
                className={`px-4 py-2 text-sm transition-colors ${
                  category === "special" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                }`}
              >
                Special Sessions
              </button>
            </div>

            <div className="mt-6 md:hidden">
              <h3 className="text-sm uppercase tracking-wider mb-4">Sort By</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSortBy("newest")}
                  className={`flex items-center justify-center px-4 py-2 text-sm transition-colors ${
                    sortBy === "newest" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Newest
                </button>
                <button
                  onClick={() => setSortBy("oldest")}
                  className={`flex items-center justify-center px-4 py-2 text-sm transition-colors ${
                    sortBy === "oldest" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                  }`}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Oldest
                </button>
                <button
                  onClick={() => setSortBy("duration-asc")}
                  className={`flex items-center justify-center px-4 py-2 text-sm transition-colors ${
                    sortBy === "duration-asc" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Shortest
                </button>
                <button
                  onClick={() => setSortBy("duration-desc")}
                  className={`flex items-center justify-center px-4 py-2 text-sm transition-colors ${
                    sortBy === "duration-desc" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
                  }`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Longest
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredLectures.map((lecture, index) => (
          <motion.div
            key={lecture.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <LectureCard lecture={lecture} />
          </motion.div>
        ))}
      </div>

      {filteredLectures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No lectures found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
