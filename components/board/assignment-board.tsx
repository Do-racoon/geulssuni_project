"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, Trash2, CheckCircle, Clock, Lock, Calendar, Users, Eye } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AssignmentCreateModal from "./assignment-create-modal"
import { useRouter } from "next/navigation"

interface Assignment {
  id: string
  title: string
  content: string
  description: string
  class_level: string
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  review_status: "pending" | "completed"
  reviewed_at?: string
  reviewed_by?: string
  views: number
  due_date: string
  submissions_count: number
  total_students: number
  is_completed: boolean
  created_at: string
  updated_at: string
  password?: string
  has_password?: boolean
}

interface User {
  id: string
  name: string
  email: string
  role: string
  class_level?: string
}

/**
 * 과제 게시판 컴포넌트
 * 과제 목록을 표시하고 관리 기능 제공
 */
export default function AssignmentBoard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [reviewFilter, setReviewFilter] = useState("all")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  const supabase = createClientComponentClient()

  // 사용자 권한 관련 변수들
  const isInstructor =
    currentUser?.role === "instructor" || currentUser?.role === "admin" || currentUser?.role === "teacher"
  const isLoggedInStudent = currentUser?.role === "user"
  const isLoggedIn = !!currentUser
  const canCreateAssignment = isInstructor
  const canSelectLevel = isInstructor
  const canManageAssignments = isInstructor

  // 실시간 인증 상태 추적
  useEffect(() => {
    let mounted = true

    const loadUserData = async () => {
      try {
        setAuthLoading(true)

        // 현재 세션 확인
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session?.user) {
          if (mounted) {
            setCurrentUser(null)
            setAuthLoading(false)
          }
          return
        }

        const authUser = session.user

        // 사용자 프로필 조회
        let userData = null

        // ID로 검색
        const { data: userByIdData, error: userByIdError } = await supabase
          .from("users")
          .select("id, name, email, role, class_level")
          .eq("id", authUser.id)
          .single()

        if (userByIdError && authUser.email) {
          // 이메일로 검색
          const { data: userByEmailData } = await supabase
            .from("users")
            .select("id, name, email, role, class_level")
            .eq("email", authUser.email)
            .single()

          userData = userByEmailData
        } else {
          userData = userByIdData
        }

        if (mounted && userData) {
          setCurrentUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            class_level: userData.class_level,
          })

          // 일반 사용자는 자신의 레벨로 필터 설정
          if (userData.role === "user" && userData.class_level) {
            setSelectedLevel(userData.class_level)
          }
        }
      } catch (error) {
        // 오류 발생 시 사용자 정보 초기화
        if (mounted) {
          setCurrentUser(null)
        }
      } finally {
        if (mounted) {
          setAuthLoading(false)
        }
      }
    }

    // 초기 로드
    loadUserData()

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      setTimeout(() => {
        if (mounted) {
          loadUserData()
        }
      }, 100)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase])

  // 인증 로딩이 완료되면 과제 목록 로드
  useEffect(() => {
    if (!authLoading) {
      loadUserAndAssignments()
    }
  }, [authLoading])

  /**
   * 사용자 정보와 과제 목록을 로드하는 함수
   */
  const loadUserAndAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Supabase에서 데이터 가져오기
      const { data, error: supabaseError } = await supabase
        .from("assignments")
        .select(`
          id,
          title,
          content,
          description,
          class_level,
          author_id,
          review_status,
          reviewed_at,
          reviewed_by,
          views,
          due_date,
          submissions_count,
          total_students,
          is_completed,
          created_at,
          updated_at,
          password,
          users!assignments_author_id_fkey(name)
        `)
        .order("created_at", { ascending: false })

      if (supabaseError) {
        throw new Error(`Database error: ${supabaseError.message}`)
      }

      // 데이터 처리
      const processedData = (data || []).map((assignment: any) => ({
        ...assignment,
        author: assignment.users ? { name: assignment.users.name } : null,
        has_password: !!assignment.password,
        password: undefined, // 클라이언트에 비밀번호 자체는 전송하지 않음
        views: assignment.views || 0,
        submissions_count: assignment.submissions_count || 0,
        total_students: assignment.total_students || 0,
      }))

      setAssignments(processedData)
      setError(null)
    } catch (error) {
      // API 폴백 시도
      try {
        const response = await fetch("/api/assignments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text()
          throw new Error(`Expected JSON but received: ${text.substring(0, 100)}...`)
        }

        const data = await response.json()
        const processedData = data.map((assignment: Assignment) => ({
          ...assignment,
          has_password: !!assignment.password,
          password: undefined,
        }))

        setAssignments(processedData)
        setError(null)
      } catch (apiError) {
        setError(`API 오류: ${apiError instanceof Error ? apiError.message : "알 수 없는 오류"}`)
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * 검수 상태 토글 핸들러
   */
  const handleReviewToggle = async (assignmentId: string) => {
    // 권한 체크
    if (!isInstructor) {
      toast({
        title: "권한 없음",
        description: "검수 상태를 변경할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedAssignment = await response.json()
        setAssignments(
          assignments.map((assignment) => (assignment.id === assignmentId ? updatedAssignment : assignment)),
        )
        toast({
          title: "검수 상태 변경 완료",
          description: `과제의 검수 상태가 ${updatedAssignment.review_status === "completed" ? "완료" : "대기"}로 변경되었습니다.`,
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "검수 상태 변경 실패",
          description: errorData.error || "검수 상태를 변경할 수 없습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "검수 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  /**
   * 과제 삭제 핸들러
   */
  const handleDelete = async (assignmentId: string, event: React.MouseEvent) => {
    event.stopPropagation()

    // 권한 체크
    if (!isInstructor) {
      toast({
        title: "권한 없음",
        description: "과제를 삭제할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("정말로 이 과제를 삭제하시겠습니까?")) {
      return
    }

    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId))
        toast({
          title: "과제 삭제 완료",
          description: "과제가 성공적으로 삭제되었습니다.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "삭제 실패",
          description: errorData.error || "과제를 삭제할 수 없습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "과제 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  /**
   * 과제 클릭 핸들러
   */
  const handleAssignmentClick = (assignment: Assignment) => {
    window.location.href = `/board/assignment/${assignment.id}`
  }

  // 필터링
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch =
      searchQuery === "" ||
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchQuery.toLowerCase())

    // 레벨 필터링
    let matchesLevel = true
    if (currentUser?.role === "user" && currentUser?.class_level) {
      const userLevel = currentUser.class_level.toLowerCase().trim()
      const assignmentLevel = assignment.class_level.toLowerCase().trim()
      matchesLevel = assignmentLevel === userLevel
    } else if (selectedLevel !== "all") {
      matchesLevel = assignment.class_level.toLowerCase() === selectedLevel.toLowerCase()
    }

    // 검수 상태 필터링
    const matchesReview =
      !isInstructor ||
      reviewFilter === "all" ||
      (reviewFilter === "pending" && assignment.review_status === "pending") ||
      (reviewFilter === "completed" && assignment.review_status === "completed")

    return matchesSearch && matchesLevel && matchesReview
  })

  /**
   * 레벨 텍스트 변환 함수
   */
  const getLevelText = (level: string) => {
    switch (level.toLowerCase().trim()) {
      case "beginner":
        return "BEGINNER"
      case "intermediate":
        return "INTERMEDIATE"
      case "advanced":
        return "ADVANCED"
      default:
        return level.toUpperCase()
    }
  }

  /**
   * 레벨 색상 변환 함수
   */
  const getLevelColor = (level: string) => {
    switch (level.toLowerCase().trim()) {
      case "beginner":
        return "bg-green-50 text-green-700 border border-green-200"
      case "intermediate":
        return "bg-blue-50 text-blue-700 border border-blue-200"
      case "advanced":
        return "bg-purple-50 text-purple-700 border border-purple-200"
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200"
    }
  }

  // 로딩 상태 표시
  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase">ASSIGNMENTS</h2>
        </div>
        <div className="text-center py-16">
          <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 font-light tracking-wider">LOADING ASSIGNMENTS...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-full overflow-hidden">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-[0.2em] uppercase text-black">ASSIGNMENTS</h2>
          {currentUser && currentUser.role === "user" && (
            <p className="text-sm text-gray-500 mt-2 font-light tracking-wider">
              {getLevelText(currentUser.class_level || "")} LEVEL ONLY
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={loadUserAndAssignments}
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider uppercase w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            REFRESH
          </Button>

          {/* 관리자, 강사만 NEW ASSIGNMENT 버튼 표시 */}
          {canCreateAssignment && <AssignmentCreateModal onAssignmentCreated={loadUserAndAssignments} />}
        </div>
      </div>

      {/* 에러 표시 */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-6">
          <p className="text-red-700 mb-4 font-light">{error}</p>
          <Button
            onClick={loadUserAndAssignments}
            variant="outline"
            size="sm"
            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
          >
            RETRY
          </Button>
        </div>
      )}

      {/* 검색 및 필터 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="SEARCH ASSIGNMENTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 border-gray-300 focus:border-black transition-colors duration-300 font-light tracking-wider"
          />
        </div>

        {/* 레벨 필터 - 관리자/강사만 모든 레벨 선택 가능 */}
        {canSelectLevel ? (
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="border-gray-300 focus:border-black font-light tracking-wider">
              <SelectValue placeholder="LEVEL FILTER" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL LEVELS</SelectItem>
              <SelectItem value="beginner">BEGINNER</SelectItem>
              <SelectItem value="intermediate">INTERMEDIATE</SelectItem>
              <SelectItem value="advanced">ADVANCED</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-11 px-4 py-2 border border-gray-300 bg-gray-50 flex items-center text-sm text-gray-600 font-light tracking-wider">
            {getLevelText(currentUser?.class_level || "")}
          </div>
        )}

        {/* 검수 상태 필터 - 관리자/강사만 표시 */}
        {isInstructor ? (
          <Select value={reviewFilter} onValueChange={setReviewFilter}>
            <SelectTrigger className="border-gray-300 focus:border-black font-light tracking-wider">
              <SelectValue placeholder="REVIEW STATUS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL STATUS</SelectItem>
              <SelectItem value="pending">PENDING</SelectItem>
              <SelectItem value="completed">COMPLETED</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-11 px-4 py-2 border border-gray-300 bg-gray-50 flex items-center text-sm text-gray-600 font-light tracking-wider">
            STUDENT VIEW
          </div>
        )}
      </div>

      {/* 게시글 목록 */}
      {assignments.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <p className="text-gray-500 mb-6 font-light tracking-wider text-lg">NO ASSIGNMENTS AVAILABLE</p>
          {canCreateAssignment && (
            <Button asChild className="bg-black text-white hover:bg-gray-800 font-light tracking-wider uppercase">
              <Link href="/board/assignment/create">CREATE ASSIGNMENT</Link>
            </Button>
          )}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <p className="text-gray-500 font-light tracking-wider text-lg">NO MATCHING ASSIGNMENTS FOUND</p>
          {isLoggedInStudent && (
            <p className="text-sm text-gray-500 mt-4">
              현재 사용자 레벨({currentUser?.class_level || "없음"})에 맞는 과제가 없습니다.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full border border-gray-300">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-11 gap-4 p-4 bg-black text-white text-xs font-light tracking-[0.15em] uppercase">
                <div className="col-span-4">TITLE</div>
                <div className="col-span-2">INSTRUCTOR</div>
                <div className="col-span-2">DATE</div>
                {/* 관리자/강사만 STATUS, ACTIONS 컬럼 표시 */}
                {isInstructor ? (
                  <>
                    <div className="col-span-2">STATUS</div>
                    <div className="col-span-1">ACTIONS</div>
                  </>
                ) : (
                  <div className="col-span-3">INFO</div>
                )}
              </div>

              {/* 과제 목록 */}
              {filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className={`grid grid-cols-11 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
                >
                  {/* 제목 */}
                  <div className="col-span-4">
                    <div className="cursor-pointer" onClick={() => handleAssignmentClick(assignment)}>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getLevelColor(assignment.class_level)} text-xs font-light tracking-wider`}>
                          {getLevelText(assignment.class_level)}
                        </Badge>
                        {assignment.has_password && (
                          <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-light tracking-wider">
                            <Lock className="h-3 w-3 mr-1" />
                            PROTECTED
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-light text-lg tracking-wide hover:text-gray-600 transition-colors duration-200 line-clamp-1">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-light">{assignment.description}</p>
                    </div>
                  </div>

                  {/* 작성자 */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-700 font-light tracking-wide">
                      {assignment.author?.name || "UNKNOWN"}
                    </span>
                  </div>

                  {/* 게시일 */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="text-sm text-gray-700 font-light">
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-light flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      DUE: {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                  </div>

                  {/* 관리자/강사만 검수상태 및 관리 버튼 표시 */}
                  {isInstructor ? (
                    <>
                      {/* 검수상태 */}
                      <div className="col-span-2 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          {assignment.review_status === "completed" ? (
                            <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-light tracking-wider">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              COMPLETED
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-light tracking-wider">
                              <Clock className="h-3 w-3 mr-1" />
                              PENDING
                            </Badge>
                          )}
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleReviewToggle(assignment.id)
                          }}
                          variant="outline"
                          size="sm"
                          className="text-xs border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider"
                        >
                          {assignment.review_status === "completed" ? "MARK PENDING" : "MARK COMPLETED"}
                        </Button>
                      </div>

                      {/* 관리 버튼 - 관리자, 강사만 표시 */}
                      <div className="col-span-1 flex items-center justify-center">
                        <div className="flex gap-1">
                          <Button
                            onClick={(e) => handleDelete(assignment.id, e)}
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-gray-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* 학생과 비로그인 사용자 공통 정보 표시 */
                    <div className="col-span-3 flex items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <Eye className="h-3 w-3 mr-1" />
                          <span>{assignment.views}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          SUBMISSIONS: {assignment.submissions_count}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          STUDENTS: {assignment.total_students}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 모바일 카드 뷰 */}
          <div className="lg:hidden space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card key={assignment.id} onClick={() => handleAssignmentClick(assignment)} className="cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getLevelColor(assignment.class_level)} text-xs font-light tracking-wider`}>
                      {getLevelText(assignment.class_level)}
                    </Badge>
                    {assignment.has_password && (
                      <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-light tracking-wider">
                        <Lock className="h-3 w-3 mr-1" />
                        PROTECTED
                      </Badge>
                    )}
                  </div>
                  {isInstructor && (
                    <div className="flex gap-1">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleReviewToggle(assignment.id)
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 p-0 border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider"
                      >
                        {assignment.review_status === "completed" ? "MARK PENDING" : "MARK COMPLETED"}
                      </Button>
                      <Button
                        onClick={(e) => handleDelete(assignment.id, e)}
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-gray-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <h3 className="font-light text-lg tracking-wide hover:text-gray-600 transition-colors duration-200 line-clamp-1">
                    {assignment.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-light">{assignment.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-gray-700 font-light">{assignment.author?.name || "UNKNOWN"}</div>
                    <div className="text-sm text-gray-700 font-light">
                      {new Date(assignment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Eye className="h-3 w-3 mr-1" />
                        <span>{assignment.views}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        DUE: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="h-3 w-3 mr-1" />
                        STUDENTS: {assignment.total_students}
                      </div>
                    </div>
                    {/* 학생 뷰에선 검수상태 표시 안함 */}
                    {!isInstructor && assignment.review_status === "completed" && (
                      <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-light tracking-wider">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
