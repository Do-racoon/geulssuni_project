import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import PostEditor from "@/components/board/post-editor"

export const metadata: Metadata = {
  title: "Create Post | Creative Agency",
  description: "Create a new post on our community board",
}

export default function CreatePostPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4">
        <Link href="/board" className="inline-flex items-center text-sm mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to board
        </Link>

        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-light tracking-wider mb-8">Create New Post</h1>
          <PostEditor />
        </div>
      </div>
    </main>
  )
}
