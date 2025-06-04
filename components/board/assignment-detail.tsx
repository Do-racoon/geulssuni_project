"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Clock,
  User,
  FileText,
  Users,
  Lock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AssignmentSubmissionForm from "./assignment-submission-form"
import AssignmentSubmissionsDisplay from "./assignment-submissions-display"

interface AssignmentDetailProps {
  assignmentId: string
}

interface Assignment {
  id: string
  title: string
  description: string
  due_date: string | null
  max_submissions: number
  current_submissions: number
  password: string | null
  author_id: string
  author_name: string
  created_at: string
  updated_at: string
}

interface UserType {
  id: string
  name: string
  email: string
  role: string
}

export default function AssignmentDetail({ assignmentId }: AssignmentDetailProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("details")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    loadAssignmentAndUser()
  }, [assignmentId])

  const loadAssignmentAndUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // 자유게시판과 동일한 방식으로 Supabase 클라이언트 생성
      const supabase = createClientComponentClient()

      // 사용자 정보 가져오기
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: userData, error: userDataError } = await supabase
          .from("users")
          .select("id, name, email, role")
          .eq("id", session.user.id)
          .single()

        if (userData) {
          setCurrentUser(userData)
        } else if (session.user.email) {
          // 이메일로 재시도 (자유게시판과 동일한 로직)
          const { data: userByEmail, error: emailError } = await supabase
            .from("users")
            .select("id, name, email, role")
            .eq("email", session.user.email)
            .single()

          if (userByEmail) {
            setCurrentUser(userByEmail)
          }
        }
      }

      // 과제 정보 가져오기
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .select(
          `
          id,
          title,
          description,
          due_date,
          max_submissions,
          current_submissions,
          password,
          author_id,
          created_at,
          updated_at,
          users!assignments_author_id_fkey(name)
        `,
        )
        .eq("id", assignmentId)
        .single()

      if (assignmentError) {
        throw assignmentError
      }

      if (assignmentData) {
        setAssignment({
          ...assignmentData,
          author_name: assignmentData.users?.name || "Unknown",
        })
      }
    } catch (error) {
      console.error("Error loading assignment:", error)
      setError("과제를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!assignment || !currentUser) return

    const isAuthor = currentUser.id === assignment.author_id
    const isAdmin = currentUser.role === "admin" || currentUser.role === "instructor"

    if (!isAuthor && !isAdmin) {
      toast.error("삭제 권한이 없습니다.")
      return
    }

    if (!confirm("정말로 이 과제를 삭제하시겠습니까?")) return

    try {
      const supabase = createClientComponentClient()
      const { error } = await supabase.from("assignments").delete().eq("id", assignmentId)

      if (error) throw error

      toast.success("과제가 삭제되었습니다.")
      window.location.href = "/board"
    } catch (error) {
      console.error("Error deleting assignment:", error)
      toast.error("과제 삭제 중 오류가 발생했습니다.")
    }
  }

  const refreshSubmissions = () => {
    setRefreshTrigger((prev) => prev + 1)
    loadAssignmentAndUser() // 과제 정보도 새로고침
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
        <p className="text-gray-600">{error || "과제를 찾을 수 없습니다."}</p>
      </div>
    )
  }

  const isOverdue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false
  const isAuthor = currentUser?.id === assignment.author_id
  const isAdmin = currentUser?.role === "admin" || currentUser?.role === "instructor"
  const canEdit = isAuthor || isAdmin

  return (
    <div className="space-y-6">
      {/* 과제 헤더 */}
      <Card className="border border-gray-200" style={{ borderRadius: "0" }}>
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-light tracking-wider">{assignment.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span className="tracking-wide">{assignment.author_name}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span className="tracking-wide">{new Date(assignment.created_at).toLocaleDateString()}</span>
                </div>
                {assignment.due_date && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className={`tracking-wide ${isOverdue ? "text-red-600" : ""}`}>
                      마감: {new Date(assignment.due_date).toLocaleDateString()}
                    </span>
                    {isOverdue && (
                      <Badge variant="destructive" className="ml-2">
                        마감
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/board/assignment/${assignmentId}/edit`)}
                  className="border-black text-black hover:bg-black hover:text-white tracking-wider font-light"
                  style={{ borderRadius: "0" }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  EDIT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white tracking-wider font-light"
                  style={{ borderRadius: "0" }}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  DELETE
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm tracking-wide">
                제출: {assignment.current_submissions}
                {assignment.max_submissions > 0 && `/${assignment.max_submissions}`}
              </span>
            </div>
            {assignment.password && (
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-gray-500" />
                <span className="text-sm tracking-wide">비밀번호 보호</span>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-6 w-6 p-0"
                  >
                    {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  </Button>
                )}
                {canEdit && showPassword && (
                  <span className="text-xs text-gray-600 font-mono">{assignment.password}</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-2">
              {isOverdue ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              <span className={`text-sm tracking-wide ${isOverdue ? "text-red-600" : "text-green-600"}`}>
                {isOverdue ? "마감됨" : "진행중"}
              </span>
            </div>
          </div>

          <div className="prose max-w-none">
            <div
              className="text-gray-700 leading-relaxed whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: assignment.description }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 탭 섹션 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 border border-gray-200" style={{ borderRadius: "0" }}>
          <TabsTrigger
            value="details"
            className="tracking-widest uppercase font-light data-[state=active]:bg-black data-[state=active]:text-white"
            style={{ borderRadius: "0" }}
          >
            <FileText className="h-4 w-4 mr-2" />
            ASSIGNMENT DETAILS
          </TabsTrigger>
          <TabsTrigger
            value="submissions"
            className="tracking-widest uppercase font-light data-[state=active]:bg-black data-[state=active]:text-white"
            style={{ borderRadius: "0" }}
          >
            <Users className="h-4 w-4 mr-2" />
            SUBMISSIONS ({assignment.current_submissions})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          <Card className="border border-gray-200" style={{ borderRadius: "0" }}>
            <CardHeader>
              <CardTitle className="text-lg font-light tracking-widest uppercase">SUBMIT YOUR WORK</CardTitle>
            </CardHeader>
            <CardContent>
              {currentUser ? (
                <AssignmentSubmissionForm
                  assignmentId={assignmentId}
                  currentUser={currentUser}
                  isOverdue={isOverdue}
                  maxSubmissions={assignment.max_submissions}
                  currentSubmissions={assignment.current_submissions}
                />
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-light tracking-wider mb-2">로그인이 필요합니다</h3>
                  <p className="text-gray-600 mb-4">과제를 제출하려면 로그인해주세요.</p>
                  <Button
                    onClick={() => (window.location.href = "/login")}
                    className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
                    style={{ borderRadius: "0" }}
                  >
                    LOGIN
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <AssignmentSubmissionsDisplay assignmentId={assignmentId} refreshTrigger={refreshTrigger} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
