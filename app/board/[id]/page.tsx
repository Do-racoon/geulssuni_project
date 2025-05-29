import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Share2 } from "lucide-react"
import { getBoardPost, getBoardComments } from "@/lib/api/board"
import { supabase } from "@/lib/supabase/client"
import CommentSection from "@/components/board/comment-section"
import { Button } from "@/components/ui/button"

interface BoardPostPageProps {
  params: {
    id: string
  }
}

export default async function BoardPostPage({ params }: BoardPostPageProps) {
  // 먼저 board_posts 테이블에서 찾기
  const post = await getBoardPost(params.id)

  // board_posts에서 찾지 못했다면 assignments 테이블에서 찾기
  if (!post) {
    try {
      const { data: assignmentData, error } = await supabase
        .from("assignments")
        .select(`
          *,
          author:users!author_id(name, email)
        `)
        .eq("id", params.id)
        .single()

      if (!error && assignmentData) {
        // assignments 데이터라면 과제 상세 페이지로 리다이렉트
        redirect(`/board/assignment/${params.id}`)
      }
    } catch (error) {
      console.error("Error checking assignments:", error)
    }
  }

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
        return "FREE"
      case "sharing":
        return "SHARE"
      case "open":
        return "QUESTION"
      case "tech":
        return "TECH"
      case "design":
        return "DESIGN"
      default:
        return category.toUpperCase()
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "free":
        return "FREE BOARD"
      case "notice":
        return "NOTICE"
      case "qna":
        return "Q&A"
      default:
        return type.toUpperCase()
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4 max-w-4xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/board"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO BOARD
          </Link>
        </div>

        {/* 게시글 헤더 */}
        <div className="border-b border-black pb-6 mb-8">
          <div className="flex items-center mb-4">
            <span className="text-xs px-3 py-1 bg-white text-black border border-black mr-3 tracking-wider font-light">
              {getCategoryLabel(post.category)}
            </span>
            <span className="text-sm text-gray-500 tracking-wider font-light">{getTypeLabel(post.type)}</span>
          </div>

          <h1 className="text-3xl font-light tracking-widest mb-4 uppercase">{post.title}</h1>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative w-10 h-10 overflow-hidden mr-3">
                <Image
                  src={post.author?.avatar || "/placeholder.svg?height=40&width=40"}
                  alt={post.author?.name || "Author"}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-light tracking-wider">{post.author?.name}</p>
                <p className="text-sm text-gray-500 tracking-wider font-light">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="tracking-wider font-light">VIEWS {post.views}</span>
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                <span className="tracking-wider font-light">{post.likes}</span>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span className="tracking-wider font-light">{post.comments_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 게시글 내용 */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-light">{post.content}</div>

          {post.image_url && (
            <div className="mt-8">
              <div className="relative w-full h-96">
                <Image src={post.image_url || "/placeholder.svg"} alt="Post image" fill className="object-cover" />
              </div>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center justify-between border-t border-b border-black py-4 mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center bg-white text-black border-black hover:bg-black hover:text-white tracking-wider font-light"
            >
              <Heart className="h-4 w-4 mr-2" />
              LIKE {post.likes}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center bg-white text-black border-black hover:bg-black hover:text-white tracking-wider font-light"
            >
              <Share2 className="h-4 w-4 mr-2" />
              SHARE
            </Button>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <CommentSection postId={params.id} initialComments={comments} />
      </div>
    </main>
  )
}
