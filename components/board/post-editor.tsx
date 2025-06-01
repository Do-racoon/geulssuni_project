"use client"

import Link from "next/link"
import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Smile, Loader2 } from "lucide-react"
import EmojiPicker from "./emoji-picker"
import RichTextEditor from "@/components/RichTextEditor"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function PostEditor() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [richContent, setRichContent] = useState("")
  const [category, setCategory] = useState<"general" | "sharing" | "open">("general")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // 사용자 정보 가져오기 (free-board.tsx와 동일한 방식)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true)

        // 1단계: Supabase 세션 확인
        const supabase = createClientComponentClient()
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log("PostEditor - 🔍 세션 확인:", {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          sessionError: sessionError?.message,
        })

        if (!session || !session.user) {
          console.log("PostEditor - ❌ 세션 없음 - 로그인 상태가 아님")
          alert("글을 작성하려면 로그인이 필요합니다.")
          router.push("/login")
          return
        }

        console.log("PostEditor - ✅ 세션 존재 - 사용자 프로필 조회 시작")

        // 2단계: 사용자 프로필 조회
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id, name, email, role, class_level, is_active")
          .eq("id", session.user.id)
          .single()

        console.log("PostEditor - 👤 사용자 프로필 조회 결과:", {
          found: !!userProfile,
          profile: userProfile,
          error: profileError?.message,
        })

        if (profileError) {
          console.error("PostEditor - ❌ 프로필 조회 오류:", profileError)

          // 이메일로 다시 시도
          console.log("PostEditor - 📧 이메일로 사용자 검색 시도:", session.user.email)
          const { data: userByEmail, error: emailError } = await supabase
            .from("users")
            .select("id, name, email, role, class_level, is_active")
            .eq("email", session.user.email)
            .single()

          if (emailError || !userByEmail) {
            console.log("PostEditor - ❌ 이메일로도 사용자를 찾을 수 없음")
            alert("사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.")
            router.push("/login")
            return
          }

          userProfile = userByEmail
        }

        if (!userProfile || !userProfile.is_active) {
          console.log("PostEditor - ❌ 비활성 사용자 또는 프로필 없음")
          alert("비활성 사용자입니다. 관리자에게 문의하세요.")
          router.push("/login")
          return
        }

        // 3단계: 사용자 정보 설정
        const userData = {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          class_level: userProfile.class_level,
        }

        console.log("PostEditor - ✅ 사용자 인증 성공:", userData)
        setUser(userData)
      } catch (error) {
        console.error("PostEditor - ❌ 사용자 정보 가져오기 오류:", error)
        alert("사용자 정보를 가져오는데 실패했습니다. 다시 로그인해주세요.")
        router.push("/login")
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 로그인 상태 재확인
    if (!user) {
      alert("글을 작성하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      console.log("PostEditor - 폼 제출 시작:", {
        title,
        content: useRichEditor ? richContent : content,
        category,
        userId: user.id,
      })

      const postData = {
        title,
        content: useRichEditor ? richContent : content,
        category,
        type: "free",
        author_id: user.id,
      }

      console.log("PostEditor - API 요청 데이터:", postData)

      const response = await fetch("/api/board-posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(postData),
      })

      console.log("PostEditor - API 응답 상태:", response.status)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("PostEditor - API 오류:", errorData)
        throw new Error(errorData.error || "게시글 저장에 실패했습니다")
      }

      const newPost = await response.json()
      console.log("PostEditor - 새 게시글 저장됨:", newPost)

      // 성공 시 게시판으로 리다이렉트
      router.push("/board")
    } catch (error) {
      console.error("PostEditor - 게시글 저장 오류:", error)
      setError(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다")
    } finally {
      setIsSubmitting(false)
    }
  }

  const insertEmoji = (emoji: string) => {
    if (useRichEditor) {
      setRichContent(richContent + emoji)
    } else {
      setContent(content + emoji)
    }
    setShowEmojiPicker(false)
  }

  // 로딩 중이거나 로그인하지 않은 경우
  if (userLoading || !user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-500">
            {userLoading ? "로그인 상태를 확인하는 중..." : "로그인이 필요합니다..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* 사용자 정보 표시 */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          <strong>{user.name}</strong>님으로 로그인됨 ({user.email}) - 역할: {user.role}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        <div className="space-y-2">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            카테고리 <span className="text-red-500">*</span>
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as "general" | "sharing" | "open")}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            required
          >
            <option value="general">자유</option>
            <option value="open">질문</option>
            <option value="sharing">공유</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            제목 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            placeholder="게시글 제목을 입력하세요"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              내용 <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">리치 에디터 사용</span>
              <input
                type="checkbox"
                checked={useRichEditor}
                onChange={() => setUseRichEditor(!useRichEditor)}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
            </div>
          </div>

          {useRichEditor ? (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <RichTextEditor initialContent={richContent} onChange={setRichContent} />
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center border-b border-gray-200 p-2 bg-gray-50">
                <div className="relative ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="이모지"
                  >
                    <Smile className="h-4 w-4" />
                  </button>
                  {showEmojiPicker && <EmojiPicker onSelect={insertEmoji} />}
                </div>
              </div>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 min-h-[200px] focus:outline-none resize-none"
                placeholder="게시글 내용을 입력하세요..."
                required={!useRichEditor}
              />
            </div>
          )}
          <p className="text-xs text-gray-500">
            {useRichEditor ? "리치 텍스트 포맷팅을 사용할 수 있습니다." : "마크다운 포맷팅을 지원합니다."}
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/board"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                게시 중...
              </>
            ) : (
              "게시글 등록"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
