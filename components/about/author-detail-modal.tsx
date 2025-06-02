"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X, Instagram, Heart } from "lucide-react"
import type { Author } from "./author-showcase"

interface AuthorDetailModalProps {
  author: Author
  isOpen: boolean
  onClose: () => void
}

export default function AuthorDetailModal({ author, isOpen, onClose }: AuthorDetailModalProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(author.likes || 0)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md z-20 hover:bg-gray-100 transition-colors cursor-pointer"
            type="button"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative h-[300px] md:h-full bg-gray-200">
            <Image
              src={author.image_url || "/placeholder.svg?height=400&width=400&query=Author"}
              alt={author.name}
              fill
              className="object-cover"
              onError={(e) => {
                console.log("Image failed to load:", author.image_url)
                e.currentTarget.src = "/placeholder.svg?height=400&width=400"
              }}
              onLoad={() => {
                console.log("Image loaded successfully:", author.image_url)
              }}
            />
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
                <div className="flex items-center space-x-4 mt-4">
                  <a
                    href={author.instagram_url || "#"}
                    target={author.instagram_url ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={`flex items-center transition-colors ${
                      author.instagram_url
                        ? "text-gray-600 hover:text-pink-600 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!author.instagram_url) {
                        e.preventDefault()
                        console.log("No Instagram URL available")
                        return
                      }
                      console.log("Instagram link clicked:", author.instagram_url)
                    }}
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
