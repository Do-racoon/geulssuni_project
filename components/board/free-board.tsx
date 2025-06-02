"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import PostCard from "@/components/board/post-card"
import { Search, Plus } from "lucide-react"
import { getFreeBoardPosts } from "@/lib/api/board"
import type { BoardPost } from "@/lib/api/board"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FreeBoard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)

  // 카테고리 정의
  const categories = [
    { value: "all", label: "ALL" },
    { value: "general", label: "FREE" },
    { value: "open", label: "QUESTION" },
    { value: "sharing", label: "SHARE" },
  ]

  // 사용자 정보 가져오기
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

        console.log("🔍 세션 확인:", {
          hasSession: !!session,
          userId: session?.user?.id,
          userEmail: session?.user?.email,
          sessionError: sessionError?.message,
        })

        if (!session || !session.user) {
          console.log("❌ 세션 없음 - 로그인 상태가 아님")
          setUser(null)
          return
        }

        console.log("✅ 세션 존재 - 사용자 프로필 조회 시작")

        // 2단계: 사용자 프로필 조회 (single() 대신 배열로 처리)
        const { data: userProfiles, error: profileError } = await supabase
          .from("users")
          .select("id, name, email, role, class_level, is_active")
          .eq("id", session.user.id)

        console.log("👤 사용자 프로필 조회 결과:", {
          found: !!userProfiles && userProfiles.length > 0,
          count: userProfiles?.length || 0,
          profiles: userProfiles,
          error: profileError?.message,
          errorCode: profileError?.code,
          errorDetails: profileError?.details,
        })

        if (profileError) {
          console.error("❌ 프로필 조회 오류:", profileError)

          // 이메일로 다시 시도
          console.log("📧 이메일로 사용자 검색 시도:", session.user.email)
          const { data: userByEmail, error: emailError } = await supabase
            .from("users")
            .select("id, name, email, role, class_level, is_active")
            .eq("email", session.user.email)

          console.log("📧 이메일 검색 결과:", {
            found: !!userByEmail && userByEmail.length > 0,
            count: userByEmail?.length || 0,
            profiles: userByEmail,
            error: emailError?.message,
          })

          if (emailError || !userByEmail || userByEmail.length === 0) {
            console.log("❌ 이메일로도 사용자를 찾을 수 없음")
            setUser(null)
            return
          }

          // 이메일로 찾은 사용자 중 첫 번째 사용
          userProfiles = userByEmail
        }

        // 프로필이 없거나 비어있는 경우
        if (!userProfiles || userProfiles.length === 0) {
          console.log("❌ 사용자 프로필이 존재하지 않음")
          setUser(null)
          return
        }

        // 여러 프로필이 있는 경우 첫 번째 사용 (중복 데이터 처리)
        const userProfile = userProfiles[0]

        if (userProfiles.length > 1) {
          console.warn(`⚠️ 중복된 사용자 프로필 발견 (${userProfiles.length}개), 첫 번째 프로필 사용:`, userProfile)
        }

        if (!userProfile.is_active) {
          console.log("❌ 비활성 사용자:", {
            hasProfile: !!userProfile,
            isActive: userProfile.is_active,
          })
          setUser(null)
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

        console.log("✅ 사용자 인증 성공:", userData)
        setUser(userData)
      } catch (error) {
        console.error("❌ 사용자 정보 가져오기 오류:", error)
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  // 실제 데이터베이스에서 게시글 가져오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        const data = await getFreeBoardPosts(selectedCategory === "all" ? "all" : selectedCategory)
        setPosts(data)
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [selectedCategory])

  // 검색 필터링
  useEffect(() => {
    let filtered = [...posts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author?.name.toLowerCase().includes(query),
      )
    }

    setFilteredPosts(filtered)
  }, [searchQuery, posts])

  // 좋아요 처리 함수
  const handleLike = async (postId: string) => {
    if (!user) {
      alert("좋아요를 누르려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }
    // 실제 좋아요 API 호출 구현 필요
    console.log(`좋아요: ${postId}`)
  }

  const handleWriteClick = async () => {
    console.log("Write button clicked, user:", user)
    console.log("User loading:", userLoading)

    if (userLoading) {
      console.log("User still loading, waiting...")
      return
    }

    if (!user) {
      console.log("No user found, redirecting to login")
      alert("글을 작성하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    console.log("User authenticated, navigating to create page")
    router.push("/board/create")
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-[180px] h-10 bg-gray-200 animate-pulse"></div>
            <div className="w-full sm:w-[300px] h-10 bg-gray-200 animate-pulse"></div>
          </div>
          <div className="w-full sm:w-auto h-10 bg-gray-200 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[240px] h-11 bg-white border border-black hover:bg-gray-50 focus:border-black transition-colors">
              <SelectValue placeholder="CATEGORY" />
            </SelectTrigger>
            <SelectContent className="border border-black">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value} className="py-3 tracking-wider font-light">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-black" />
            <Input
              type="search"
              placeholder="SEARCH"
              className="pl-10 h-11 bg-white border border-black hover:bg-gray-50 focus:border-black transition-colors tracking-wider font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleWriteClick}
          disabled={userLoading}
          className="w-full sm:w-auto h-11 px-6 bg-black hover:bg-gray-800 text-white tracking-wider font-light disabled:opacity-50"
        >
          <Plus className="mr-2 h-4 w-4" />
          {userLoading ? "LOADING..." : "WRITE"}
        </Button>
      </div>

      {/* 사용자 상태 디버그 정보 */}
      {process.env.NODE_ENV === "development" && (
        <div className="bg-gray-100 p-4 rounded text-sm">
          <p>User Loading: {userLoading ? "true" : "false"}</p>
          <p>User: {user ? `${user.name} (${user.email})` : "null"}</p>
        </div>
      )}

      {filteredPosts.length > 0 ? (
        <div className="grid gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      ) : (
        <Card className="border border-black">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-gray-500 mb-4 tracking-wider font-light">
              {searchQuery ? "NO RESULTS FOUND" : "NO POSTS YET"}
            </p>
            <div className="flex gap-2">
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border border-black hover:bg-gray-50 tracking-wider font-light"
                >
                  RESET SEARCH
                </Button>
              )}
              <Button
                onClick={handleWriteClick}
                disabled={userLoading}
                className="bg-black hover:bg-gray-800 text-white tracking-wider font-light disabled:opacity-50"
              >
                {userLoading ? "LOADING..." : "WRITE FIRST POST"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
