import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { boardPosts } from "@/data/board-posts"
import PostComments from "@/components/board/post-comments"

export const metadata: Metadata = {
  title: "Post Detail | Creative Agency",
  description: "View and interact with community posts",
}

export default function PostDetailPage({ params }: { params: { id: string } }) {
  // Find the post by ID
  const post = boardPosts.find((p) => p.id === params.id)

  if (!post) {
    return (
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-2xl font-light mb-8">Post not found</h1>
        <Link href="/board" className="flex items-center text-sm uppercase tracking-wider hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Link>
      </div>
    )
  }

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <Link href="/board" className="flex items-center text-sm uppercase tracking-wider hover:underline mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Board
        </Link>

        <article className="max-w-4xl mx-auto">
          <div className="mb-8">
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
            <h1 className="text-4xl font-light mt-4 mb-2 tracking-wider">{post.title}</h1>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                  <Image
                    src={post.author.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={post.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{post.author.name}</p>
                  <p className="text-sm text-gray-500">{formattedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {post.image && (
            <div className="mb-8">
              <div className="relative h-96 w-full">
                <Image src={post.image || "/placeholder.svg"} alt={post.title} fill className="object-cover" />
              </div>
            </div>
          )}

          <div className="prose max-w-none mb-12">
            <p className="whitespace-pre-line">{post.content}</p>
          </div>

          <hr className="my-12" />

          <PostComments postId={post.id} />
        </article>
      </div>
    </main>
  )
}
