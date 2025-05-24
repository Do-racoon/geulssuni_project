"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X, Instagram, Heart } from "lucide-react"
import type { Author } from "./author-showcase"

interface AuthorDetailModalProps {
  author: Author
  onClose: () => void
}

export default function AuthorDetailModal({ author, onClose }: AuthorDetailModalProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(author.likes)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!liked) {
      setLikeCount(likeCount + 1)
      setLiked(true)
    } else {
      setLikeCount(likeCount - 1)
      setLiked(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button onClick={onClose} className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-10">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[300px] md:h-full">
            <Image src={author.image || "/placeholder.svg"} alt={author.name} fill className="object-cover" />
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-light tracking-wider">{author.name}</h2>
            <p className="text-gray-600 mt-1">{author.role}</p>

            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500">Experience</h3>
                <p className="mt-1">{author.experience}</p>
              </div>

              <div>
                <h3 className="text-sm uppercase tracking-wider text-gray-500">Quote</h3>
                <p className="mt-1 italic">"{author.quote}"</p>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-gray-500">Portfolio</h3>
                  <p className="mt-1">{author.portfolioCount} works</p>
                </div>

                <div className="flex items-center space-x-4">
                  <a
                    href={author.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>

                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 ${
                      liked ? "text-red-500" : "text-gray-600 hover:text-red-500"
                    } transition-colors`}
                  >
                    <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
                    <span>{likeCount}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
