"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Users, Clock, FileText, Download, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth"
import { toast } from "sonner"
import AssignmentSubmissionForm from "@/components/board/assignment-submission-form"
import AssignmentSubmissionList from "@/components/board/assignment-submission-list"

interface Assignment {
  id: string
  title: string
  content: string
  description: string
  class_level: string
  author_id: string
  author?: {
    name: string
    email?: string
  }
  review_status: "pending" | "completed"
  reviewed_at?: string
  reviewed_by?: string
  views: number
  due_date: string
  submissions_count: number
  current_submissions: number
  max_submissions: number
  total_students: number
  is_completed: boolean
  created_at: string
  updated_at: string
  attachment_url?: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  class_level?: string
}

export default function AssignmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [isDeleting, setIsDeleting] = useState(false)

  const assignmentId = params.id as string

  // 사용자 권한 관련 변수들
  const isInstructor =
    currentUser?.role === "instructor" || currentUser?.role === "admin" || currentUser?.role === "teacher"
  const isAuthor = assignment?.author_id === currentUser?.id
  const canEdit = isInstructor || isAuthor
  const canDelete = isInstructor || isAuthor
  const canSubmit =
    currentUser &&
    currentUser.role === "user" &&
    currentUser.class_level === assignment?.class_level &&
    new Date(assignment?.due_date || "") > new Date() &&
    (assignment?.current_submissions || 0) < (assignment?.max_submissions || 0)

  useEffect(() => {
    loadUserAndAssignment()
  }, [assignmentId])

  const loadUserAndAssignment = async () => {
    try {
      setLoading(true)
      setError(null)

      // 현재 사용자 정보 가져오기
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (userError) {
        console.error("사용자 로딩 실패:", userError)
      }

      // 과제 정보 가져오기
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setAssignment(data)
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

  const handleDelete = async () => {
    if (!confirm("정말로 이 과제를 삭제하시겠습니까?")) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assignments/${assignmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("과제가 성공적으로 삭제되었습니다!")
        router.push("/board")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "과제를 삭제할 수 없습니다.")
      }
    } catch (error) {
      console.error("삭제 오류:", error)
      toast.error("과제 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleReviewToggle = async () => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const updatedAssignment = await response.json()
        setAssignment(updatedAssignment)
        toast.success(
          `검수 상태가 ${updatedAssignment.review_status === "completed" ? "완료" : "대기"}로 변경되었습니다.`,
        )
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "검수 상태를 변경할 수 없습니다.")
      }
    } catch (error) {
      console.error("검수 상태 업데이트 오류:", error)
      toast.error("검수 상태 변경 중 오류가 발생했습니다.")
    }
  }

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
        return "bg-white text-black border border-black"
      case "intermediate":
        return "bg-black text-white border border-black"
      case "advanced":
        return "bg-gray-800 text-white border border-gray-800"
      default:
        return "bg-gray-100 text-gray-900 border border-gray-300"
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto py-12 px-4">
          <div className="text-center py-16">
            <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-6"></div>
            <p className="text-gray-600 font-light tracking-wider">LOADING ASSIGNMENT...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !assignment) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto py-12 px-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-6">
            <p className="text-red-700 mb-4 font-light">{error || "과제를 찾을 수 없습니다."}</p>
            <Button
              onClick={() => router.push("/board")}
              variant="outline"
              size="sm"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              게시판으로 돌아가기
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const isExpired = new Date(assignment.due_date) < new Date()
  const submissionFull = (assignment.current_submissions || 0) >= (assignment.max_submissions || 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto py-12 px-4">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/board"
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          게시판으로 돌아가기
        </Link>

        {/* 과제 헤더 */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Badge
              className={`${getLevelColor(assignment.class_level)} text-xs font-light tracking-wider`}
              style={{ borderRadius: "0" }}
            >
              {getLevelText(assignment.class_level)}
            </Badge>
            <Badge
              className={`${assignment.review_status === "completed" ? "bg-black text-white" : "bg-gray-200 text-gray-800"} text-xs font-light tracking-wider`}
              style={{ borderRadius: "0" }}
            >
              {assignment.review_status === "completed" ? "COMPLETED" : "PENDING"}
            </Badge>
            {isExpired && (
              <Badge
                className="bg-red-100 text-red-800 border border-red-300 text-xs font-light tracking-wider"
                style={{ borderRadius: "0" }}
              >
                EXPIRED
              </Badge>
            )}
          </div>
          <h1 className="text-4xl font-light text-black mb-4 tracking-widest uppercase">{assignment.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                Due: {new Date(assignment.due_date).toLocaleDateString()}{" "}
                {new Date(assignment.due_date).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                Submissions: {assignment.current_submissions || 0}/{assignment.max_submissions || 0}
              </span>
            </div>
            <div>Author: {assignment.author?.name || "Unknown"}</div>
          </div>
        </div>

        {/* 관리 버튼 */}
        {(canEdit || canDelete) && (
          <div className="flex gap-3 mb-8">
            {canEdit && (
              <Button
                asChild
                variant="outline"
                className="border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                style={{ borderRadius: "0" }}
              >
                <Link href={`/board/assignment/${assignmentId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  EDIT
                </Link>
              </Button>
            )}
            {canDelete && (
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white tracking-widest uppercase font-light"
                style={{ borderRadius: "0" }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isDeleting ? "DELETING..." : "DELETE"}
              </Button>
            )}
            {isInstructor && (
              <Button
                onClick={handleReviewToggle}
                variant="outline"
                className="border-black text-black hover:bg-black hover:text-white tracking-widest uppercase font-light"
                style={{ borderRadius: "0" }}
              >
                {assignment.review_status === "completed" ? "MARK AS PENDING" : "MARK AS COMPLETED"}
              </Button>
            )}
          </div>
        )}

        {/* 탭 */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start gap-8 h-auto p-0">
            <TabsTrigger
              value="details"
              className="text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-0 py-3"
            >
              DETAILS
            </TabsTrigger>
            <TabsTrigger
              value="submissions"
              className="text-gray-600 data-[state=active]:text-black data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent px-0 py-3"
            >
              SUBMISSIONS
            </TabsTrigger>
          </TabsList>

          {/* 상세 내용 탭 */}
          <TabsContent value="details" className="space-y-8">
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-xl font-light tracking-widest uppercase">ASSIGNMENT CONTENT</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap tracking-wide font-light">{assignment.content}</div>

                  {assignment.attachment_url && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200" style={{ borderRadius: "0" }}>
                      <p className="text-sm font-light tracking-widest uppercase text-blue-800 mb-2">ATTACHMENT</p>
                      <a
                        href={assignment.attachment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 hover:underline tracking-wide"
                      >
                        <FileText className="h-4 w-4" />
                        <span>Download Attachment</span>
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 제출 폼 */}
            {canSubmit && (
              <Card className="border-black" style={{ borderRadius: "0" }}>
                <CardHeader className="border-b border-black">
                  <CardTitle className="text-xl font-light tracking-widest uppercase">SUBMIT ASSIGNMENT</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <AssignmentSubmissionForm assignmentId={assignmentId} onSubmitSuccess={loadUserAndAssignment} />
                </CardContent>
              </Card>
            )}

            {/* 제출 불가 메시지 */}
            {currentUser && !canSubmit && (
              <Card className="border-gray-300" style={{ borderRadius: "0" }}>
                <CardContent className="p-8">
                  <div className="text-center">
                    {isExpired ? (
                      <p className="text-red-600 font-light tracking-wider">
                        THIS ASSIGNMENT HAS EXPIRED AND IS NO LONGER ACCEPTING SUBMISSIONS
                      </p>
                    ) : submissionFull ? (
                      <p className="text-amber-600 font-light tracking-wider">
                        THIS ASSIGNMENT HAS REACHED THE MAXIMUM NUMBER OF SUBMISSIONS
                      </p>
                    ) : currentUser.class_level !== assignment.class_level ? (
                      <p className="text-gray-600 font-light tracking-wider">
                        THIS ASSIGNMENT IS FOR {getLevelText(assignment.class_level)} LEVEL STUDENTS ONLY
                      </p>
                    ) : (
                      <p className="text-gray-600 font-light tracking-wider">YOU CANNOT SUBMIT TO THIS ASSIGNMENT</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 제출 목록 탭 */}
          <TabsContent value="submissions" className="space-y-8">
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-xl font-light tracking-widest uppercase">SUBMISSIONS</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AssignmentSubmissionList
                  assignmentId={assignmentId}
                  isInstructor={isInstructor}
                  currentUserId={currentUser?.id || ""}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
