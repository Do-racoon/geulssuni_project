"use client"

import Link from "next/link"
import Image from "next/image"
import { Heart, MessageCircle, Pin } from "lucide-react"
import type { FreeBoardPost } from "@/data/board-posts"

interface PostCardProps {
  post: FreeBoardPost
  onLike: (postId: string) => void
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <div className="border border-gray-200 bg-white">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center mb-2">
              {post.isPinned && (
                <span className="mr-2 text-gray-500">
                  <Pin className="h-4 w-4" />
                </span>
              )}
              <span
                className={`text-xs px-2 py-1 ${
                  post.category === "general"
                    ? "bg-gray-100"
                    : post.category === "sharing"
                      ? "bg-gray-200"
                      : "bg-gray-800 text-white"
                }`}
              >
                {post.category === "general" ? "General" : post.category === "sharing" ? "Sharing" : "Open Topics"}
              </span>
            </div>
            <Link href={`/board/${post.id}`} className="block">
              <h3 className="text-xl font-light tracking-wider hover:underline">{post.title}</h3>
            </Link>
          </div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 line-clamp-3">{post.content}</p>
        </div>

        {post.image && (
          <div className="mb-4">
            <div className="relative h-48 w-full">
              <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2">
              <Image src={post.author.avatar || "/placeholder.svg?height=32&width=32"} alt={post.author.name} fill />
            </div>
            <span className="text-sm">{post.author.name}</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => onLike(post.id)}
              className={`flex items-center text-sm ${post.isLiked ? "text-red-500" : "text-gray-500"}`}
              aria-label={post.isLiked ? "Unlike" : "Like"}
            >
              <Heart className={`h-4 w-4 mr-1 ${post.isLiked ? "fill-red-500" : ""}`} />
              <span>{post.likes}</span>
            </button>
            <Link href={`/board/${post.id}`} className="flex items-center text-sm text-gray-500">
              <MessageCircle className="h-4 w-4 mr-1" />
              <span>{post.comments}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
