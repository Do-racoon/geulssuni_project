"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Heart } from "lucide-react"

// Mock comments data
const initialComments = [
  {
    id: "comment-1",
    author: {
      name: "Jane Cooper",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "This is really insightful! I've been thinking about this topic for a while.",
    createdAt: "2023-05-15T10:30:00Z",
    likes: 5,
    isLiked: false,
  },
  {
    id: "comment-2",
    author: {
      name: "Robert Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "I disagree with some points, but overall a good perspective.",
    createdAt: "2023-05-15T11:45:00Z",
    likes: 2,
    isLiked: true,
  },
  {
    id: "comment-3",
    author: {
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content: "Thanks for sharing this! I learned something new today.",
    createdAt: "2023-05-16T09:15:00Z",
    likes: 8,
    isLiked: false,
  },
]

interface PostCommentsProps {
  postId: string
}

export default function PostComments({ postId }: PostCommentsProps) {
  const [comments, setComments] = useState(initialComments)
  const [newComment, setNewComment] = useState("")

  const handleLikeComment = (commentId: string) => {
    setComments(
      comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked,
          }
        }
        return comment
      }),
    )
  }

  const handleSubmitComment = () => {
    if (!newComment.trim()) return

    const comment = {
      id: `comment-${Date.now()}`,
      author: {
        name: "Current User", // In a real app, this would be the logged-in user
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  return (
    <div>
      <h2 className="text-2xl font-light mb-6 tracking-wider">Comments ({comments.length})</h2>

      <div className="mb-8">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="mb-4 min-h-[100px]"
        />
        <Button onClick={handleSubmitComment} disabled={!newComment.trim()}>
          Post Comment
        </Button>
      </div>

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="border-b border-gray-100 pb-6">
            <div className="flex items-start">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={comment.author.avatar || "/placeholder.svg"}
                  alt={comment.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleLikeComment(comment.id)}
                    className={`flex items-center text-sm ${comment.isLiked ? "text-red-500" : "text-gray-500"}`}
                    aria-label={comment.isLiked ? "Unlike" : "Like"}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${comment.isLiked ? "fill-red-500" : ""}`} />
                    <span>{comment.likes}</span>
                  </button>
                </div>
                <p className="mt-2">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
