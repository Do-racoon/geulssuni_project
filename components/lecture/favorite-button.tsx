"use client"

import { useState, useEffect } from "react"
import { Bookmark, BookmarkCheck } from "lucide-react"

interface FavoriteButtonProps {
  lectureId: string
}

export default function FavoriteButton({ lectureId }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Check if this lecture is in favorites
    const favorites = JSON.parse(localStorage.getItem("favoriteLectures") || "[]")
    setIsFavorite(favorites.includes(lectureId))
  }, [lectureId])

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favoriteLectures") || "[]")

    if (!isFavorite) {
      localStorage.setItem("favoriteLectures", JSON.stringify([...favorites, lectureId]))
    } else {
      localStorage.setItem("favoriteLectures", JSON.stringify(favorites.filter((id: string) => id !== lectureId)))
    }

    setIsFavorite(!isFavorite)
  }

  return (
    <button
      onClick={toggleFavorite}
      className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {isFavorite ? (
        <>
          <BookmarkCheck className="h-4 w-4" />
          <span className="text-sm">Saved</span>
        </>
      ) : (
        <>
          <Bookmark className="h-4 w-4" />
          <span className="text-sm">Save</span>
        </>
      )}
    </button>
  )
}
