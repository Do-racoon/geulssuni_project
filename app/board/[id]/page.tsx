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
  console.log(`[BoardPostPage] Server component loading post with ID: ${params.id}`)

  // UUID 형식 검증
  if (!isValidUUID(params.id)) {
    console.log(`[BoardPostPage] Invalid UUID format: ${params.id}`)
    notFound()
  }

  try {
    // 서버 컴포넌트용 Supabase 클라이언트 생성
    const supabase = createServerClient()
    console.log(`[BoardPostPage] Server Supabase client created`)

    async function checkIfAssignment(id: string) {
      try {
        console.log(`[BoardPostPage] Checking if ${id} is an assignment`)
        const { data: assignmentData, error } = await supabase.from("assignments").select("id").eq("id", id).single()
        const isAssignment = !error && assignmentData
        console.log(`[BoardPostPage] Assignment check result: ${isAssignment}`)
        return isAssignment
      } catch (error) {
        console.error("[BoardPostPage] Error checking assignments:", error)
        return false
      }
    }

    // 조회수 증가 함수
    async function incrementViews(postId: string) {
      try {
        console.log(`[BoardPostPage] Incrementing views for post: ${postId}`)
        await supabase.rpc("increment_post_views", { post_id: postId })
        console.log(`[BoardPostPage] Views incremented successfully`)
      } catch (error) {
        console.error("[BoardPostPage] Error incrementing views:", error)
      }
    }

    console.log(`[BoardPostPage] Querying post with ID: ${params.id}`)

    const { data: post, error } = await supabase
      .from("board_posts")
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq("id", params.id)
      .single()

    if (error) {
      console.log(`[BoardPostPage] Database error occurred:`, error)

      if (error.code === "PGRST116") {
        console.log(`[BoardPostPage] No rows found, checking assignments...`)
        const isAssignment = await checkIfAssignment(params.id)

        if (isAssignment) {
          console.log(`[BoardPostPage] Found assignment, redirecting...`)
          redirect(`/board/assignment/${params.id}`)
        }

        console.log(`[BoardPostPage] Not found in any table`)
        notFound()
      } else {
        console.error(`[BoardPostPage] Database error details:`, error)
        return (
          <div className="container mx-auto py-24 px-4">
            <h1 className="text-2xl font-bold text-red-600">데이터베이스 오류</h1>
            <p className="mt-4">게시글을 불러오는 중 오류가 발생했습니다.</p>
            <Link href="/board" className="inline-block mt-4 text-blue-600 hover:underline">
              게시판으로 돌아가기
            </Link>
          </div>
        )
      }
    }

    if (!post) {
      console.log(`[BoardPostPage] Post is null`)
      notFound()
    }

    // 조회수 증가 (에러가 발생해도 페이지는 정상 렌더링)
    try {
      await incrementViews(params.id)
    } catch (error) {
      console.error("[BoardPostPage] Failed to increment views:", error)
    }

    console.log(`[BoardPostPage] Post found: ${post.title}`)

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

      try {
        // 1. 잘못된 img 태그 구조 수정
        let fixedContent = content.replace(/<img([^>]*?)>src="([^"]*?)"/g, '<img$1 src="$2">')

        // 2. img 태그에 적절한 스타일과 속성 추가
        fixedContent = fixedContent.replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/g, (match, before, src, after) => {
          // 이미 style이 있는지 확인
          if (before.includes("style=") || after.includes("style=")) {
            return match
          }

          // 이미지 URL 검증
          try {
            new URL(src)
          } catch {
            console.warn(`[BoardPostPage] Invalid image URL: ${src}`)
            return `<div class="bg-gray-100 p-4 text-center text-gray-500 border rounded">이미지를 불러올 수 없습니다</div>`
          }

          return `<img${before} src="${src}"${after} style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; display: block; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" loading="lazy" crossorigin="anonymous" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" /><div style="display: none; background: #f3f4f6; padding: 16px; text-align: center; color: #6b7280; border-radius: 8px; margin: 16px 0;">이미지를 불러올 수 없습니다</div>`
        })

        // 3. 잘못된 텍스트 제거
        fixedContent = fixedContent.replace(/(?:^|\s)src="[^"]*"(?:\s|$)/g, " ")

        // 4. 연속된 공백 정리
        fixedContent = fixedContent.replace(/\s+/g, " ").trim()

        return fixedContent
      } catch (error) {
        console.error("[BoardPostPage] Error fixing HTML content:", error)
        return content.replace(/<[^>]*>/g, "")
      }
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
        console.error("[BoardPostPage] Error rendering content:", error)
        return <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-light">{post.content}</div>
      }
    }

    const getAvatarUrl = (name: string) => {
      return `/placeholder.svg?height=40&width=40&query=${encodeURIComponent(name || "user")}`
    }

    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-24 px-4 max-w-4xl">
          <div className="mb-8">
            <Link
              href="/board"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO BOARD
            </Link>
          </div>

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
                    style={{ objectFit: "cover" }}
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

          <div className="mb-12">{renderContent()}</div>

          <PostActions post={post} />

          <CommentSection postId={params.id} initialComments={[]} />
        </div>
      </main>
    )
  } catch (error) {
    console.error("[BoardPostPage] Unexpected error in main function:", error)
    return (
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-2xl font-bold text-red-600">시스템 오류</h1>
        <p className="mt-4">예상치 못한 오류가 발생했습니다.</p>
        <Link href="/board" className="inline-block mt-4 text-blue-600 hover:underline">
          게시판으로 돌아가기
        </Link>
      </div>
    )
  }
}
