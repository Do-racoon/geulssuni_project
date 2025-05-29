"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  RefreshCw,
  PlusCircle,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Lock,
  Calendar,
  Users,
  Eye,
} from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface Assignment {
  id: string
  title: string
  content: string
  description: string
  class_level: string // beginner, intermediate, advanced
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
  password?: string // 비밀번호 필드 추가
  has_password?: boolean // 비밀번호 유무 표시용
}

interface User {
  id: string
  name: string
  email: string
  role: string
  class_level?: string
}

export default function AssignmentBoard() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [reviewFilter, setReviewFilter] = useState("all")
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const { toast } = useToast()

  // 비밀번호 관련 상태
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState(false)

  // 사용자 권한 관련 변수들 - 모든 사용자가 과제 관리 가능하도록 변경
  const isInstructor =
    currentUser?.role === "instructor" || currentUser?.role === "admin" || currentUser?.role === "teacher"
  const canCreateAssignment = true // 모든 사용자가 과제 생성 가능
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

      // assignments 테이블에서 데이터 가져오기
      const response = await fetch("/api/assignments", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        // 비밀번호 유무 표시 추가
        const processedData = data.map((assignment: Assignment) => ({
          ...assignment,
          has_password: !!assignment.password,
          password: undefined, // 클라이언트에 비밀번호 자체는 전송하지 않음
        }))
        setAssignments(processedData)
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

  const handleReviewToggle = async (assignmentId: string) => {
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
      console.error("검수 상태 업데이트 오류:", error)
      toast({
        title: "오류 발생",
        description: "검수 상태 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (assignmentId: string, event: React.MouseEvent) => {
    event.stopPropagation()

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
      console.error("삭제 오류:", error)
      toast({
        title: "오류 발생",
        description: "과제 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    }
  }

  // 과제 클릭 핸들러
  const handleAssignmentClick = (assignment: Assignment) => {
    // 비밀번호가 있는 경우 비밀번호 확인 모달 표시
    if (assignment.has_password && !isInstructor) {
      setSelectedAssignment(assignment)
      setPasswordInput("")
      setPasswordError(false)
      setPasswordDialogOpen(true)
    } else {
      // 비밀번호가 없거나 관리자/강사인 경우 바로 이동
      window.location.href = `/board/assignment/${assignment.id}`
    }
  }

  // 비밀번호 확인 핸들러
  const handlePasswordCheck = async () => {
    if (!selectedAssignment) return

    try {
      const response = await fetch(`/api/assignments/${selectedAssignment.id}/check-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: passwordInput }),
      })

      if (response.ok) {
        setPasswordDialogOpen(false)
        // 비밀번호 인증 성공 시 세션 스토리지에 저장
        sessionStorage.setItem(`assignment_${selectedAssignment.id}_authenticated`, "true")
        window.location.href = `/board/assignment/${selectedAssignment.id}`
      } else {
        setPasswordError(true)
      }
    } catch (error) {
      console.error("비밀번호 확인 오류:", error)
      setPasswordError(true)
    }
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
      matchesLevel = assignment.class_level === currentUser.class_level
    } else if (selectedLevel !== "all") {
      matchesLevel = assignment.class_level === selectedLevel
    }

    // 검수 상태 필터링
    const matchesReview =
      reviewFilter === "all" ||
      (reviewFilter === "pending" && assignment.review_status === "pending") ||
      (reviewFilter === "completed" && assignment.review_status === "completed")

    return matchesSearch && matchesLevel && matchesReview
  })

  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "BASIC"
      case "intermediate":
        return "INTERMEDIATE"
      case "advanced":
        return "ADVANCED"
      default:
        return level.toUpperCase()
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
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

  if (loading) {
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
      {/* 헤더 - 디올 스타일 */}
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
          {canCreateAssignment && (
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-800 transition-all duration-300 font-light tracking-wider uppercase w-full sm:w-auto"
            >
              <Link href="/board/assignment/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                NEW ASSIGNMENT
              </Link>
            </Button>
          )}
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

      {/* 검색 및 필터 - 반응형 개선 */}
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

        {/* 레벨 필터 */}
        {canSelectLevel ? (
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="border-gray-300 focus:border-black font-light tracking-wider">
              <SelectValue placeholder="LEVEL FILTER" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ALL LEVELS</SelectItem>
              <SelectItem value="beginner">BASIC</SelectItem>
              <SelectItem value="intermediate">INTERMEDIATE</SelectItem>
              <SelectItem value="advanced">ADVANCED</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="h-11 px-4 py-2 border border-gray-300 bg-gray-50 flex items-center text-sm text-gray-600 font-light tracking-wider">
            {getLevelText(currentUser?.class_level || "")}
          </div>
        )}

        {/* 검수 상태 필터 */}
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
      </div>

      {/* 게시글 목록 - 반응형 개선 */}
      {assignments.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <p className="text-gray-500 mb-6 font-light tracking-wider text-lg">NO ASSIGNMENTS AVAILABLE</p>
          {canCreateAssignment && (
            <Button asChild className="bg-black text-white hover:bg-gray-800 font-light tracking-wider uppercase">
              <Link href="/board/assignment/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                CREATE ASSIGNMENT
              </Link>
            </Button>
          )}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-20 border border-gray-200">
          <p className="text-gray-500 font-light tracking-wider text-lg">NO MATCHING ASSIGNMENTS FOUND</p>
        </div>
      ) : (
        <>
          {/* 데스크톱 테이블 뷰 */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full border border-gray-300">
              {/* 테이블 헤더 */}
              <div className="grid grid-cols-12 gap-4 p-4 bg-black text-white text-xs font-light tracking-[0.15em] uppercase">
                <div className="col-span-4">TITLE</div>
                <div className="col-span-2">INSTRUCTOR</div>
                <div className="col-span-2">DATE</div>
                <div className="col-span-2">STATUS</div>
                <div className="col-span-1">STATS</div>
                <div className="col-span-1">ACTIONS</div>
              </div>

              {/* 과제 목록 */}
              {filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className={`grid grid-cols-12 gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
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
                    {isInstructor && (
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
                    )}
                  </div>

                  {/* 통계 */}
                  <div className="col-span-1 flex flex-col justify-center">
                    <div className="text-sm text-gray-700 font-light flex items-center">
                      <Eye className="h-3 w-3 mr-1" />
                      {assignment.views}
                    </div>
                    <div className="text-xs text-gray-400 font-light flex items-center mt-1">
                      <Users className="h-3 w-3 mr-1" />
                      {assignment.submissions_count}/{assignment.total_students}
                    </div>
                  </div>

                  {/* 관리 버튼 - 모든 사용자가 볼 수 있도록 변경 */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="flex gap-1">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-gray-300 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/board/assignment/${assignment.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모바일/태블릿 카드 뷰 */}
          <div className="lg:hidden space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card
                key={assignment.id}
                className="border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
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
                      <h3
                        className="font-light text-lg tracking-wide cursor-pointer hover:text-gray-600 transition-colors duration-200"
                        onClick={() => handleAssignmentClick(assignment)}
                      >
                        {assignment.title}
                      </h3>
                    </div>
                    {/* 모든 사용자가 관리 버튼을 볼 수 있도록 변경 */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-gray-300 hover:border-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300"
                      >
                        <Link href={`/board/assignment/${assignment.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
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
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 font-light line-clamp-2">{assignment.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 font-light">Instructor</p>
                      <p className="font-light">{assignment.author?.name || "UNKNOWN"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-light">Created</p>
                      <p className="font-light">{new Date(assignment.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-light flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due Date
                      </p>
                      <p className="font-light">{new Date(assignment.due_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-light">Stats</p>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center font-light">
                          <Eye className="h-3 w-3 mr-1" />
                          {assignment.views}
                        </span>
                        <span className="flex items-center font-light">
                          <Users className="h-3 w-3 mr-1" />
                          {assignment.submissions_count}/{assignment.total_students}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isInstructor && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <Button
                        onClick={() => handleReviewToggle(assignment.id)}
                        variant="outline"
                        size="sm"
                        className="w-full text-xs border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider"
                      >
                        {assignment.review_status === "completed" ? "MARK PENDING" : "MARK COMPLETED"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* 상태 표시 - 반응형 개선 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 font-light tracking-wider pt-6 border-t border-gray-200 gap-4">
        <div>
          {filteredAssignments.length} OF {assignments.length} ASSIGNMENTS
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block bg-green-500 rounded-sm"></span> COMPLETED
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block bg-gray-400 rounded-sm"></span> PENDING
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block bg-yellow-500 rounded-sm"></span> PROTECTED
          </span>
        </div>
      </div>

      {/* 비밀번호 확인 모달 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md mx-4">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-light tracking-widest uppercase">
              PASSWORD REQUIRED
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-center text-gray-600 font-light">
              This assignment is password protected. Please enter the password to continue.
            </p>
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value)
                    setPasswordError(false)
                  }}
                  className={`border-gray-300 focus:border-black ${passwordError ? "border-red-500" : ""}`}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handlePasswordCheck()
                    }
                  }}
                />
                {passwordError && <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              className="border-black text-black hover:bg-black hover:text-white tracking-widest uppercase font-light w-full sm:w-auto"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              onClick={handlePasswordCheck}
              className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light w-full sm:w-auto"
            >
              CONTINUE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
