"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, FileText, Users } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import AssignmentSubmissionList from "@/components/board/assignment-submission-list"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AssignmentSubmissionPopup from "@/components/board/assignment-submission-popup"
import AssignmentSubmissionsDisplay from "@/components/board/assignment-submissions-display"

interface AssignmentDetailProps {
  assignmentId: string
}

export default function AssignmentDetail({ assignmentId }: AssignmentDetailProps) {
  const [assignment, setAssignment] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [refreshSubmissions, setRefreshSubmissions] = useState(0)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 병렬로 데이터 로드
        const [assignmentResult, userResult] = await Promise.all([
          // 과제 정보와 조회수 증가를 병렬로 처리
          Promise.all([
            supabase
              .from("assignments")
              .select(`
              id, title, content, description, class_level, due_date, 
              max_submissions, current_submissions, views, created_at, updated_at, password,
              author:users!author_id(id, name, email),
              instructor:users!instructor_id(id, name, email)
            `)
              .eq("id", assignmentId)
              .single(),
            incrementViews(assignmentId),
          ]),
          // 현재 사용자 정보
          supabase.auth.getUser(),
        ])

        const [assignmentData] = assignmentResult
        const { data: assignmentInfo, error: assignmentError } = assignmentData

        if (assignmentError) {
          console.error("과제 조회 오류:", assignmentError)
          setError("과제를 불러올 수 없습니다.")
          return
        }

        // 사용자 정보 처리
        const {
          data: { user },
        } = userResult
        if (user) {
          const { data: dbUser } = await supabase
            .from("users")
            .select("id, name, email, role, class_level")
            .eq("id", user.id)
            .single()
          setCurrentUser(dbUser)
        }

        // 비밀번호 처리
        const processedAssignment = {
          ...assignmentInfo,
          has_password: !!assignmentInfo.password,
          password: undefined,
        }

        setAssignment(processedAssignment)
      } catch (err) {
        console.error("데이터 로딩 오류:", err)
        setError("데이터를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [assignmentId])

  // 조회수 증가 함수 - 응답을 기다리지 않음
  function incrementViews(id: string) {
    return supabase.rpc("increment_assignment_views", { assignment_id: id })
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-6"></div>
        <p className="text-gray-600 font-light tracking-wider">LOADING ASSIGNMENT...</p>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 font-light tracking-wider">{error || "과제를 찾을 수 없습니다."}</p>
      </div>
    )
  }

  const isAdmin = currentUser?.role === "admin"
  const isInstructor = currentUser?.role === "instructor" || currentUser?.role === "teacher"
  const isPasswordProtected = assignment.has_password
  const canAccessWithoutPassword = isAdmin || isInstructor
  const isOverdue = new Date(assignment.due_date) < new Date()

  const formattedDueDate = new Date(assignment.due_date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const formattedCreatedDate = new Date(assignment.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleSubmissionSuccess = () => {
    setRefreshSubmissions((prev) => prev + 1)
  }

  return (
    <>
      {/* 과제 헤더 */}
      <div className="border-b border-black pb-6 mb-8">
        <div className="flex items-center mb-4">
          <span className="text-xs px-3 py-1 bg-white text-black border border-black mr-3 tracking-wider font-light">
            {assignment.class_level}
          </span>
          <span className="text-sm text-gray-500 tracking-wider font-light">ASSIGNMENT</span>
        </div>

        <h1 className="text-3xl font-light tracking-widest mb-4 uppercase">{assignment.title}</h1>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <div className="mr-3">
              <p className="font-light tracking-wider">{assignment.author?.name}</p>
              <p className="text-sm text-gray-500 tracking-wider font-light">{formattedCreatedDate}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span className="tracking-wider font-light">DUE: {formattedDueDate}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span className="tracking-wider font-light">
                {assignment.current_submissions}/{assignment.max_submissions > 0 ? assignment.max_submissions : "∞"}
              </span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              <span className="tracking-wider font-light">VIEWS: {assignment.views}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 과제 내용 */}
      <div className="prose prose-lg max-w-none mb-12">
        <div className="whitespace-pre-wrap text-gray-800 leading-relaxed font-light">{assignment.content}</div>
      </div>

      <Separator className="my-12" />

      {/* 제출 섹션 */}
      <div className="mb-12">
        <h2 className="text-2xl font-light tracking-widest mb-6 uppercase">SUBMISSIONS</h2>

        <div className="bg-gray-50 p-6 mb-8 border border-gray-200">
          <h3 className="text-lg font-light tracking-widest mb-4 uppercase">SUBMIT YOUR ASSIGNMENT</h3>
          <AssignmentSubmissionPopup
            assignmentId={assignmentId}
            onSubmissionSuccess={handleSubmissionSuccess}
            disabled={
              isOverdue ||
              (assignment.max_submissions > 0 && assignment.current_submissions >= assignment.max_submissions)
            }
          />

          {isOverdue && (
            <p className="text-red-600 text-sm mt-2 font-light tracking-wider">SUBMISSION DEADLINE HAS PASSED</p>
          )}

          {assignment.max_submissions > 0 && assignment.current_submissions >= assignment.max_submissions && (
            <p className="text-orange-600 text-sm mt-2 font-light tracking-wider">MAXIMUM SUBMISSIONS REACHED</p>
          )}
        </div>

        {/* 공개 제출 목록 */}
        <AssignmentSubmissionsDisplay assignmentId={assignmentId} refreshTrigger={refreshSubmissions} />

        {/* 관리자/강사용 제출 목록 */}
        {(isAdmin || isInstructor) && (
          <div className="mt-8 border-t border-gray-300 pt-8">
            <h3 className="text-lg font-light tracking-widest mb-4 uppercase">INSTRUCTOR VIEW - ALL SUBMISSIONS</h3>
            <AssignmentSubmissionList assignmentId={assignmentId} currentUser={currentUser} />
          </div>
        )}
      </div>
    </>
  )
}
