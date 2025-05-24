"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Lecture } from "@/data/lectures"
import { Clock, Calendar, Bookmark, BookmarkCheck } from "lucide-react"

interface LectureCardProps {
  lecture: Lecture
}

export default function LectureCard({ lecture }: LectureCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)

    // In a real app, you would save this to user preferences in a database
    const favorites = JSON.parse(localStorage.getItem("favoriteLectures") || "[]")

    if (!isFavorite) {
      localStorage.setItem("favoriteLectures", JSON.stringify([...favorites, lecture.id]))
    } else {
      localStorage.setItem("favoriteLectures", JSON.stringify(favorites.filter((id: string) => id !== lecture.id)))
    }
  }

  return (
    <Link href={`/lectures/${lecture.id}`} className="block group">
      <div className="bg-white border border-gray-100 shadow-sm group-hover:shadow-md transition-all duration-300 h-full content-card">
        <div className="content-card-image">
          <Image
            src={lecture.thumbnail || "/placeholder.svg"}
            alt={lecture.title}
            fill
            className="object-cover monochrome"
            style={{ objectPosition: "center" }}
          />
          <div
            className={`absolute top-3 right-3 px-3 py-1 text-xs uppercase tracking-wider ${
              lecture.category === "beginner"
                ? "bg-gray-100"
                : lecture.category === "intermediate"
                  ? "bg-gray-200"
                  : lecture.category === "advanced"
                    ? "bg-gray-800 text-white"
                    : "bg-black text-white"
            }`}
          >
            {lecture.category}
          </div>
          <button
            onClick={toggleFavorite}
            className="absolute top-3 left-3 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-black" />
            ) : (
              <Bookmark className="h-4 w-4 text-gray-500" />
            )}
          </button>
        </div>
        <div className="content-card-body">
          <h3 className="content-card-title group-hover:underline">{lecture.title}</h3>
          <p className="content-card-author">by {lecture.instructor}</p>

          <div className="flex flex-wrap gap-2 mb-4">
            {lecture.tags.map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 bg-gray-100">
                {tag}
              </span>
            ))}
          </div>

          <div className="content-card-stats">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{lecture.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{lecture.durationMinutes} min</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
