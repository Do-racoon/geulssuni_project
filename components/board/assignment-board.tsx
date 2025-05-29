"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, PlusCircle, Edit, Trash2, CheckCircle, Clock } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"

interface AssignmentPost {
  id: string
  title: string
  content: string
  category: string // beginner, intermediate, advanced
  type: string
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  review_status: "pending" | "completed"
  reviewed_at?: string
  reviewed_by?: string
  views: number
  created_at: string
  updated_at: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  class_level?: string
}

export default function AssignmentBoard() {
  const [posts, setPosts] = useState<AssignmentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [reviewFilter, setReviewFilter] = useState("all")
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // 사용자 권한 관련 변수들
  const isInstructor = currentUser?.role === "instructor" || currentUser?.role === "admin"
  const canCreateAssignment = isInstructor
  const canSelectLevel = isInstructor

  useEffect(() => {
    loadUserAndAssignments()
  }, [])

  const loadUserAndAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 사용자 정보 가져오기
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)

        // 일반 사용자는 자신의 레벨로 필터 설정
        if (user?.role === "user" && user?.class_level) {
          setSelectedLevel(user.class_level)
        }
      } catch (userError) {
        console.error("사용자 로딩 실패:", userError)
      }

      // 과제 게시글 가져오기
      const response = await fetch("/api/board-posts/assignments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(data)
        setError(null)
      } else {
        const errorText = await response.text()
        setError(`API 오류 (${response.status}): ${errorText}`)
      }
    } catch (error) {
      console.error("과제 로딩 오류:", error)
      setError(`로딩 오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewToggle = async (postId: string) => {
    try {
      const response = await fetch(`/api/board-posts/${postId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedPost = await response.json()
        setPosts(posts.map((post) => (post.id === postId ? updatedPost : post)))
      }
    } catch (error) {
      console.error("검수 상태 업데이트 오류:", error)
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/board-posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
      } else {
        alert("게시글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("삭제 오류:", error)
      alert("게시글 삭제 중 오류가 발생했습니다.")
    }
  }

  // 필터링
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())

    // 레벨 필터링
    let matchesLevel = true
    if (currentUser?.role === "user" && currentUser?.class_level) {
      matchesLevel = post.category === currentUser.class_level
    } else if (selectedLevel !== "all") {
      matchesLevel = post.category === selectedLevel
    }

    // 검수 상태 필터링
    const matchesReview =
      reviewFilter === "all" ||
      (reviewFilter === "pending" && post.review_status === "pending") ||
      (reviewFilter === "completed" && post.review_status === "completed")

    return matchesSearch && matchesLevel && matchesReview
  })

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "기초반"
      case "intermediate":
        return "중급반"
      case "advanced":
        return "전문반"
      default:
        return level
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-light tracking-wider">과제 📋 (로딩중...)</h2>
        </div>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-500">과제를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light tracking-wider">과제 📋</h2>
          {currentUser && currentUser.role === "user" && (
            <p className="text-sm text-gray-500 mt-1">
              {getLevelText(currentUser.class_level || "")} 과제만 표시됩니다
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={loadUserAndAssignments} variant="outline" size="sm" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            새로고침
          </Button>
          {canCreateAssignment && (
            <Button asChild className="flex items-center gap-2">
              <Link href="/board/assignment/create">
                <PlusCircle className="h-4 w-4" />
                과제 등록
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadUserAndAssignments} variant="outline" size="sm">
            다시 시도
          </Button>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="과제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* 레벨 필터 */}
        {canSelectLevel ? (
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="난이도 필터" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 난이도</SelectItem>
              <SelectItem value="beginner">기초반</SelectItem>
              <SelectItem value="intermediate">중급반</SelectItem>
              <SelectItem value="advanced">전문반</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="w-full sm:w-[180px] h-11 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center text-sm text-gray-600">
            {getLevelText(currentUser?.class_level || "")}
          </div>
        )}

        {/* 검수 상태 필터 */}
        <Select value={reviewFilter} onValueChange={setReviewFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="검수 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 상태</SelectItem>
            <SelectItem value="pending">검수중</SelectItem>
            <SelectItem value="completed">검수완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 게시글 목록 */}
      {posts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500 mb-4">등록된 과제가 없습니다. 😔</p>
          {canCreateAssignment && (
            <Button asChild>
              <Link href="/board/assignment/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                과제 등록
              </Link>
            </Button>
          )}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">검색 조건에 맞는 과제가 없습니다. 🔍</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 테이블 헤더 */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
            <div className="col-span-4">제목</div>
            <div className="col-span-2">작성자</div>
            <div className="col-span-2">게시일</div>
            <div className="col-span-2">검수상태</div>
            <div className="col-span-1">조회수</div>
            <div className="col-span-1">관리</div>
          </div>

          {/* 게시글 목록 */}
          {filteredPosts.map((post) => (
            <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* 제목 */}
                <div className="col-span-1 md:col-span-4">
                  <Link href={`/board/assignment/${post.id}`} className="block">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelColor(post.category)}>{getLevelText(post.category)}</Badge>
                    </div>
                    <h3 className="font-medium hover:text-blue-600 transition-colors">{post.title}</h3>
                  </Link>
                </div>

                {/* 작성자 */}
                <div className="col-span-1 md:col-span-2">
                  <span className="text-sm text-gray-600">{post.author?.name || "알 수 없음"}</span>
                </div>

                {/* 게시일 */}
                <div className="col-span-1 md:col-span-2">
                  <span className="text-sm text-gray-600">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>

                {/* 검수상태 */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2">
                    {post.review_status === "completed" ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        검수완료
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="h-3 w-3 mr-1" />
                        검수중
                      </Badge>
                    )}
                    {isInstructor && (
                      <Button onClick={() => handleReviewToggle(post.id)} variant="outline" size="sm" className="ml-2">
                        {post.review_status === "completed" ? "검수중으로" : "완료로"}
                      </Button>
                    )}
                  </div>
                  {post.reviewed_at && (
                    <div className="text-xs text-gray-500 mt-1">{new Date(post.reviewed_at).toLocaleDateString()}</div>
                  )}
                </div>

                {/* 조회수 */}
                <div className="col-span-1 md:col-span-1">
                  <span className="text-sm text-gray-600">{post.views}</span>
                </div>

                {/* 관리 버튼 */}
                <div className="col-span-1 md:col-span-1">
                  {(isInstructor || post.author_id === currentUser?.id) && (
                    <div className="flex gap-1">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/board/assignment/${post.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button onClick={() => handleDelete(post.id)} variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 상태 표시 */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          {filteredPosts.length}개의 과제 발견 (전체 {posts.length}개)
        </div>
        <div className="flex gap-2 items-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block bg-green-500 rounded-full"></span> 검수완료
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block bg-yellow-500 rounded-full"></span> 검수중
          </span>
        </div>
      </div>
    </div>
  )
}
