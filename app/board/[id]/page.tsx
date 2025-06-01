import { notFound, redirect } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Heart, MessageCircle, Eye } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import CommentSection from "@/components/board/comment-section"
import PostActions from "@/components/board/post-actions"

interface BoardPostPageProps {
  params: {
    id: string
  }
}

// UUID 형식 검증 함수
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function BoardPostPage({ params }: BoardPostPageProps) {
  // UUID 형식 검증
  if (!isValidUUID(params.id)) {
    console.log("❌ Invalid UUID format:", params.id)
    notFound()
  }

  // 서버 컴포넌트용 Supabase 클라이언트 생성
  const supabase = createServerClient()

  async function checkIfAssignment(id: string) {
    try {
      const { data: assignmentData, error } = await supabase.from("assignments").select("id").eq("id", id).single()
      return !error && assignmentData
    } catch (error) {
      console.error("Error checking assignments:", error)
      return false
    }
  }

  // 조회수 증가 함수
  async function incrementViews(postId: string) {
    try {
      await supabase.rpc("increment_post_views", { post_id: postId })
    } catch (error) {
      console.error("Error incrementing views:", error)
    }
  }

  try {
    console.log("🔍 Querying post with ID:", params.id)

    const { data: post, error } = await supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.log("❌ Database error occurred:", error)

      if (error.code === "PGRST116") {
        console.log("🔍 No rows found, checking assignments...")
        const isAssignment = await checkIfAssignment(params.id)

        if (isAssignment) {
          console.log("📋 Found assignment, redirecting...")
          redirect(`/board/assignment/${params.id}`)
        }

        console.log("❌ Not found in any table")
        notFound()
      } else {
        throw new Error(`Database error: ${error.message}`)
      }
    }

    if (!post) {
      console.log("❌ Post is null")
      notFound()
    }

    // 조회수 증가
    await incrementViews(params.id)

    console.log("✅ Post found:", post.title)

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

    // content에서 잘못된 HTML 구조 수정
    const fixHtmlContent = (content: string) => {
      if (!content) return ""

      // 잘못된 img 태그 구조 수정: <img...>src="..." -> <img ... src="...">
      let fixedContent = content.replace(/<img([^>]*?)>src="([^"]*?)"/g, '<img$1 src="$2">')

      // img 태그에 스타일 추가
      fixedContent = fixedContent.replace(
        /<img([^>]*?)src="([^"]*?)"([^>]*?)>/g,
        '<img$1src="$2"$3 style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block;" loading="lazy" crossorigin="anonymous">',
      )

      // 잘못된 텍스트 제거 (src="..." 가 단독으로 있는 경우)
      fixedContent = fixedContent.replace(/(?:^|\s)src="[^"]*"(?:\s|$)/g, " ")

      return fixedContent
    }

    // content 렌더링
    const renderContent = () => {
      if (!post.content) return <div>No content available</div>

      try {
        const fixedContent = fixHtmlContent(post.content)
        const hasHtmlTags = /<[a-z][\s\S]*>/i.test(fixedContent)

        if (hasHtmlTags) {
          return <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: fixedContent }} />
        } else {
          return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-light">{fixedContent}</div>
        }
      } catch (error) {
        console.error("Error rendering content:", error)
        return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-light">{post.content}</div>
      }
    }

    const getAvatarUrl = (name: string) => {
      return `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(name || "user")}`
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
                    src={getAvatarUrl(post.author?.name || "Anonymous")}
                    alt={post.author?.name || "Author"}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-light tracking-wider">{post.author?.name || "Anonymous"}</p>
                  <p className="text-sm text-gray-500 tracking-wider font-light">{formattedDate}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  <span className="tracking-wider font-light">{(post.views || 0) + 1}</span>
                </div>
                <div className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span className="tracking-wider font-light">{post.likes || 0}</span>
                </div>
                <div className="flex items-center">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span className="tracking-wider font-light">{post.comments_count || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 게시글 내용 */}
          <div className="mb-12">
            {renderContent()}

            {post.image_url && (
              <div className="mt-8">
                <div className="relative w-full h-96">
                  <Image
                    src={post.image_url || "/placeholder.svg"}
                    alt="Post image"
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg?height=400&width=800"
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼들 */}
          <PostActions post={post} />

          {/* 댓글 섹션 */}
          <CommentSection postId={params.id} initialComments={[]} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("💥 Exception occurred:", error)

    return (
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-2xl font-bold text-red-600">디버깅 정보</h1>
        <div className="mt-4 space-y-4">
          <div>
            <strong>요청된 ID:</strong> {params.id}
          </div>
          <div>
            <strong>오류 메시지:</strong> {error instanceof Error ? error.message : String(error)}
          </div>
        </div>
        <Link href="/board" className="inline-block mt-4 text-blue-600 hover:underline">
          게시판으로 돌아가기
        </Link>
      </div>
    )
  }
}
