import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react"
import { getBoardPost, getBoardComments } from "@/lib/api/board"
import CommentSection from "@/components/board/comment-section"
import { Button } from "@/components/ui/button"

interface BoardPostPageProps {
  params: {
    id: string
  }
}

export default async function BoardPostPage({ params }: BoardPostPageProps) {
  const post = await getBoardPost(params.id)

  if (!post) {
    notFound()
  }

  const comments = await getBoardComments(params.id)

  const formattedDate = new Date(post.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "general":
        return "일반"
      case "sharing":
        return "공유"
      case "open":
        return "자유주제"
      default:
        return category
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "free":
        return "자유게시판"
      case "notice":
        return "공지사항"
      case "qna":
        return "Q&A"
      default:
        return type
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link href="/board" className="inline-flex items-center text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            게시판으로 돌아가기
          </Link>
        </div>

        {/* 게시글 헤더 */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <div className="flex items-center mb-4">
            <span
              className={`text-xs px-3 py-1 rounded-full mr-3 ${
                post.category === "general"
                  ? "bg-blue-100 text-blue-800"
                  : post.category === "sharing"
                    ? "bg-green-100 text-green-800"
                    : "bg-purple-100 text-purple-800"
              }`}
            >
              {getCategoryLabel(post.category)}
            </span>
            <span className="text-sm text-gray-500">{getTypeLabel(post.type)}</span>
          </div>

          <h1 className="text-3xl font-light tracking-wider mb-4">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                <Image
                  src={post.author?.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={post.author?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{post.author?.name}</p>
                <p className="text-sm text-gray-500">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>조회 {post.views}</span>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{post.comments_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</div>

          {post.image_url && (
            <div className="mt-8">
              <div className="relative w-full h-96">
                <Image
                  src={post.image_url || "/placeholder.svg"}
                  alt="Post image"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between border-t border-b border-gray-200 py-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="flex items-center">
              <Heart className="h-4 w-4 mr-2" />
              좋아요 {post.likes}
            </Button>
            <Button variant="outline" size="sm" className="flex items-center">
              <Share2 className="h-4 w-4 mr-2" />
              공유하기
            </Button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <CommentSection postId={params.id} initialComments={comments} />
      </div>
    </main>
  )
}
