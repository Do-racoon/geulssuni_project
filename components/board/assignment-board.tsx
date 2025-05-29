"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, PlusCircle, Edit, Trash2, CheckCircle, Clock, Lock } from "lucide-react"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

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

  // 사용자 권한 관련 변수들
  const isInstructor =
    currentUser?.role === "instructor" || currentUser?.role === "admin" || currentUser?.role === "teacher"
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

  const handleDelete = async (assignmentId: string) => {
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
        return "bg-gray-100 text-gray-900 border border-gray-300"
      case "intermediate":
        return "bg-gray-200 text-gray-900 border border-gray-400"
      case "advanced":
        return "bg-black text-white border border-black"
      default:
        return "bg-gray-100 text-gray-900 border border-gray-300"
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
    <div className="space-y-8">
      {/* 헤더 - 디올 스타일 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-3xl font-light tracking-[0.2em] uppercase text-black">ASSIGNMENTS</h2>
          {currentUser && currentUser.role === "user" && (
            <p className="text-sm text-gray-500 mt-2 font-light tracking-wider">
              {getLevelText(currentUser.class_level || "")} LEVEL ONLY
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadUserAndAssignments}
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider uppercase"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            REFRESH
          </Button>
          {canCreateAssignment && (
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-800 transition-all duration-300 font-light tracking-wider uppercase"
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

      {/* 검색 및 필터 - 디올 스타일 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* 게시글 목록 - 디올 테이블 스타일 */}
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
        <div className="space-y-0 border border-gray-300">
          {/* 테이블 헤더 - 각진 디자인 */}
          <div className="hidden md:grid md:grid-cols-12 gap-6 p-6 bg-black text-white text-xs font-light tracking-[0.15em] uppercase">
            <div className="col-span-4">TITLE</div>
            <div className="col-span-2">INSTRUCTOR</div>
            <div className="col-span-2">DATE</div>
            <div className="col-span-2">STATUS</div>
            <div className="col-span-1">VIEWS</div>
            <div className="col-span-1">ACTIONS</div>
          </div>

          {/* 과제 목록 - 각진 디자인 */}
          {filteredAssignments.map((assignment, index) => (
            <div
              key={assignment.id}
              className={`border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200 ${
                index % 2 === 0 ? "bg-white" : "bg-gray-25"
              }`}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 items-center">
                {/* 제목 */}
                <div className="col-span-1 md:col-span-4">
                  <div className="block group cursor-pointer" onClick={() => handleAssignmentClick(assignment)}>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getLevelColor(assignment.class_level)} text-xs font-light tracking-wider`}>
                        {getLevelText(assignment.class_level)}
                      </Badge>
                      {assignment.has_password && (
                        <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs font-light tracking-wider">
                          <Lock className="h-3 w-3 mr-1" />
                          PASSWORD
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-light text-lg tracking-wide group-hover:text-gray-600 transition-colors duration-200">
                      {assignment.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2 font-light">{assignment.description}</p>
                  </div>
                </div>

                {/* 작성자 */}
                <div className="col-span-1 md:col-span-2">
                  <span className="text-sm text-gray-700 font-light tracking-wide">
                    {assignment.author?.name || "UNKNOWN"}
                  </span>
                </div>

                {/* 게시일 */}
                <div className="col-span-1 md:col-span-2">
                  <div className="text-sm text-gray-700 font-light">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 font-light">
                    DUE: {new Date(assignment.due_date).toLocaleDateString()}
                  </div>
                </div>

                {/* 검수상태 */}
                <div className="col-span-1 md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    {assignment.review_status === "completed" ? (
                      <Badge className="bg-black text-white text-xs font-light tracking-wider">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-200 text-gray-800 text-xs font-light tracking-wider">
                        <Clock className="h-3 w-3 mr-1" />
                        PENDING
                      </Badge>
                    )}
                  </div>
                  {assignment.reviewed_at && (
                    <div className="text-xs text-gray-400 font-light">
                      {new Date(assignment.reviewed_at).toLocaleDateString()}
                    </div>
                  )}
                  {isInstructor && (
                    <Button
                      onClick={() => handleReviewToggle(assignment.id)}
                      variant="outline"
                      size="sm"
                      className="mt-2 text-xs border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider"
                    >
                      {assignment.review_status === "completed" ? "MARK PENDING" : "MARK COMPLETED"}
                    </Button>
                  )}
                </div>

                {/* 조회수 */}
                <div className="col-span-1 md:col-span-1">
                  <div className="text-sm text-gray-700 font-light">{assignment.views}</div>
                  <div className="text-xs text-gray-400 font-light">
                    {assignment.submissions_count}/{assignment.total_students}
                  </div>
                </div>

                {/* 관리 버튼 */}
                <div className="col-span-1 md:col-span-1">
                  {(isInstructor || assignment.author_id === currentUser?.id) && (
                    <div className="flex gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300"
                      >
                        <Link href={`/board/assignment/${assignment.id}/edit`}>
                          <Edit className="h-3 w-3" />
                        </Link>
                      </Button>
                      <Button
                        onClick={() => handleDelete(assignment.id)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 hover:border-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
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

      {/* 상태 표시 - 디올 스타일 */}
      <div className="flex items-center justify-between text-sm text-gray-500 font-light tracking-wider pt-6 border-t border-gray-200">
        <div>
          {filteredAssignments.length} OF {assignments.length} ASSIGNMENTS
        </div>
        <div className="flex gap-6 items-center">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block bg-black"></span> COMPLETED
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 inline-block bg-gray-300"></span> PENDING
          </span>
        </div>
      </div>

      {/* 비밀번호 확인 모달 */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
                />
                {passwordError && <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordDialogOpen(false)}
              className="border-black text-black hover:bg-black hover:text-white tracking-widest uppercase font-light"
            >
              CANCEL
            </Button>
            <Button
              type="button"
              onClick={handlePasswordCheck}
              className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
            >
              CONTINUE
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
