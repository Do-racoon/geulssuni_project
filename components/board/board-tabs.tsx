"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import PostCard from "./post-card"
import { getFreeBoardPosts, getAssignmentPosts, togglePostLike, type BoardPost } from "@/lib/api/board"
import { Plus, Lock, LogIn } from "lucide-react"
import Link from "next/link"

interface BoardTabsProps {
  defaultTab?: string
  userRole?: string
  userClassLevel?: string
  userId?: string
}

export default function BoardTabs({
  defaultTab = "free",
  userRole = "user",
  userClassLevel = "beginner",
  userId = "c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f",
}: BoardTabsProps) {
  const [allFreePosts, setAllFreePosts] = useState<BoardPost[]>([])
  const [filteredFreePosts, setFilteredFreePosts] = useState<BoardPost[]>([])
  const [assignmentPosts, setAssignmentPosts] = useState<BoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const router = useRouter()

  // 로그인 상태 체크
  const isLoggedIn = userRole && userRole !== "guest"

  useEffect(() => {
    fetchInitialPosts()
  }, [userRole, userClassLevel])

  useEffect(() => {
    // 클라이언트 사이드 필터링
    if (activeCategory === "all") {
      setFilteredFreePosts(allFreePosts)
    } else {
      setFilteredFreePosts(allFreePosts.filter((post) => post.category === activeCategory))
    }
  }, [activeCategory, allFreePosts])

  const fetchInitialPosts = async () => {
    setLoading(true)
    try {
      const [freeData, assignmentData] = await Promise.all([
        getFreeBoardPosts("all"), // 모든 자유게시판 데이터 가져오기
        getAssignmentPosts(userRole, userClassLevel),
      ])

      setAllFreePosts(freeData)
      setFilteredFreePosts(freeData)
      setAssignmentPosts(assignmentData)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string, type: string) => {
    const isLiked = await togglePostLike(postId, userId)

    // 상태 업데이트
    const updatePosts = (posts: BoardPost[]) =>
      posts.map((post) =>
        post.id === postId ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1, isLiked } : post,
      )

    const setFreePosts = (updatedPosts: BoardPost[]) => {
      setAllFreePosts(updatedPosts)
      setFilteredFreePosts(updatedPosts.filter((post) => post.category === activeCategory))
    }

    if (type === "free") {
      setFreePosts(updatePosts(allFreePosts))
    } else if (type === "assignment") {
      setAssignmentPosts(updatePosts(assignmentPosts))
    }
  }

  // 로그인 리다이렉션 함수
  const handleLoginRedirect = () => {
    router.push("/login")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Tabs defaultValue="free" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-xl shadow-sm">
          <TabsTrigger
            value="free"
            className="text-lg data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
          >
            자유게시판
          </TabsTrigger>
          {isLoggedIn ? (
            <TabsTrigger
              value="assignment"
              className="text-lg data-[state=active]:bg-white data-[state=active]:shadow-md rounded-lg transition-all duration-200 font-medium"
            >
              과제게시판
            </TabsTrigger>
          ) : (
            <div
              className="flex items-center justify-center text-gray-400 text-lg font-medium cursor-pointer bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              onClick={handleLoginRedirect}
            >
              <Lock className="h-4 w-4 mr-2" />
              과제게시판
            </div>
          )}
        </TabsList>

        <TabsContent value="free" className="space-y-6">
          {/* 자유게시판 헤더 */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-gray-800">자유게시판</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                누구나 이용 가능
              </span>
            </div>
            {isLoggedIn ? (
              <Link href="/board/create">
                <button className="flex items-center bg-gradient-to-r from-gray-800 to-black text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-900 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Plus className="h-5 w-5 mr-2" />
                  글쓰기
                </button>
              </Link>
            ) : (
              <button
                onClick={handleLoginRedirect}
                className="flex items-center bg-gray-300 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-400 hover:text-gray-700 transition-all duration-200"
              >
                <LogIn className="h-5 w-5 mr-2" />
                로그인 후 글쓰기
              </button>
            )}
          </div>

          {/* 개선된 카테고리 필터 */}
          <div className="flex flex-wrap gap-3 mb-8 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            {[
              { key: "all", label: "전체", color: "gray" },
              { key: "free", label: "자유", color: "blue" },
              { key: "sharing", label: "공유", color: "green" },
              { key: "question", label: "질문", color: "purple" },
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  activeCategory === category.key
                    ? "bg-black text-white shadow-lg"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {filteredFreePosts.length > 0 ? (
            <div className="space-y-4">
              {filteredFreePosts.map((post) => (
                <PostCard key={post.id} post={post} onLike={(postId) => handleLike(postId, "free")} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-200">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">아직 게시글이 없습니다</h3>
                <p className="text-sm">첫 번째 게시글을 작성해보세요!</p>
              </div>
            </div>
          )}
        </TabsContent>

        {isLoggedIn && (
          <TabsContent value="assignment" className="space-y-6">
            {/* 과제게시판 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-800">과제게시판</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {userClassLevel === "beginner" ? "기초반" : userClassLevel === "intermediate" ? "중급반" : "고급반"}
                </span>
                {userRole === "admin" && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    관리자
                  </span>
                )}
              </div>
              <Link href="/board/assignment/create">
                <button className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                  <Plus className="h-5 w-5 mr-2" />
                  과제 등록
                </button>
              </Link>
            </div>

            {assignmentPosts.length > 0 ? (
              <div className="space-y-4">
                {assignmentPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={(postId) => handleLike(postId, "assignment")} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-500 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200">
                <div className="max-w-md mx-auto">
                  <h3 className="text-lg font-semibold mb-2">아직 과제가 없습니다</h3>
                  <p className="text-sm">첫 번째 과제를 등록해보세요!</p>
                </div>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
