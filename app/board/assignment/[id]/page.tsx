import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Users, CheckCircle, Clock, Upload, FileText } from "lucide-react"
import Link from "next/link"
import AssignmentSubmissionForm from "@/components/board/assignment-submission-form"
import AssignmentSubmissionList from "@/components/board/assignment-submission-list"

export const metadata: Metadata = {
  title: "과제 상세",
  description: "과제 상세 페이지입니다.",
}

async function getAssignment(id: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    const { data: assignment, error } = await supabase
      .from("assignments")
      .select(`
        *,
        author:users!author_id(name, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("과제를 찾을 수 없습니다:", error)
      return null
    }

    // 조회수 증가
    await supabase
      .from("assignments")
      .update({ views: assignment.views + 1 })
      .eq("id", id)

    return assignment
  } catch (error) {
    console.error("과제 조회 중 오류:", error)
    return null
  }
}

async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single()

    return dbUser
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error)
    return null
  }
}

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const assignment = await getAssignment(params.id)
  const currentUser = await getCurrentUser()

  if (!assignment) {
    notFound()
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
        return "bg-gray-100 text-gray-800 border border-gray-300"
    }
  }

  const isOverdue = new Date(assignment.due_date) < new Date()
  const daysUntilDue = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  const isInstructor = currentUser?.role === "instructor" || currentUser?.role === "admin"
  const isStudent = currentUser?.role === "user"

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Button
            asChild
            variant="outline"
            className="border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
            style={{ borderRadius: "0" }}
          >
            <Link href="/board">← BACK TO BOARD</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 과제 정보 */}
          <div className="lg:col-span-2 space-y-8">
            {/* 과제 정보 카드 */}
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-4 font-light tracking-wide uppercase">
                      {assignment.title}
                    </CardTitle>
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="tracking-wide">INSTRUCTOR: {assignment.author?.name || "UNKNOWN"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="tracking-wide">
                          CREATED: {new Date(assignment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={getLevelColor(assignment.class_level) + " tracking-widest"}
                      style={{ borderRadius: "0" }}
                    >
                      {getLevelText(assignment.class_level)}
                    </Badge>
                    {assignment.is_completed && (
                      <Badge
                        className="bg-green-100 text-green-800 border border-green-300 tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        COMPLETED
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose max-w-none mb-8">
                  <div className="text-gray-700 leading-relaxed tracking-wide font-light whitespace-pre-wrap">
                    {assignment.content || assignment.description}
                  </div>
                </div>

                {/* 첨부파일 */}
                {assignment.attachment_url && (
                  <div className="mb-8 p-6 bg-gray-50 border border-gray-300" style={{ borderRadius: "0" }}>
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                      <span className="font-light tracking-widest uppercase text-gray-800">ATTACHMENT</span>
                    </div>
                    <a
                      href={assignment.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline tracking-wide mt-2 block"
                    >
                      {assignment.attachment_url.split("/").pop()}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 학생용 제출 폼 */}
            {isStudent && (
              <Card className="border-black" style={{ borderRadius: "0" }}>
                <CardHeader className="border-b border-black">
                  <CardTitle className="text-xl font-light tracking-widest uppercase flex items-center gap-3">
                    <Upload className="h-5 w-5" />
                    SUBMIT ASSIGNMENT
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <AssignmentSubmissionForm
                    assignmentId={assignment.id}
                    currentUser={currentUser}
                    isOverdue={isOverdue}
                    maxSubmissions={assignment.max_submissions}
                    currentSubmissions={assignment.current_submissions}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* 오른쪽: 과제 상태 및 제출 현황 */}
          <div className="space-y-8">
            {/* 마감일 정보 */}
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-lg font-light tracking-widest uppercase flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  DUE DATE
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className={`text-xl font-light mb-2 tracking-wide ${isOverdue ? "text-red-600" : "text-gray-900"}`}
                  >
                    {new Date(assignment.due_date).toLocaleDateString()}
                    <br />
                    {new Date(assignment.due_date).toLocaleTimeString()}
                  </div>
                  <div
                    className={`text-sm tracking-widest uppercase ${isOverdue ? "text-red-500" : daysUntilDue <= 3 ? "text-orange-500" : "text-gray-500"}`}
                  >
                    {isOverdue
                      ? `${Math.abs(daysUntilDue)} DAYS OVERDUE`
                      : daysUntilDue === 0
                        ? "DUE TODAY"
                        : `${daysUntilDue} DAYS LEFT`}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 제출 현황 */}
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-lg font-light tracking-widest uppercase flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  SUBMISSION STATUS
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-light text-gray-900 mb-2 tracking-wide">
                    {assignment.current_submissions} / {assignment.max_submissions}
                  </div>
                  <div className="text-sm text-gray-600 tracking-widest uppercase mb-4">
                    {assignment.max_submissions > 0
                      ? `${Math.round((assignment.current_submissions / assignment.max_submissions) * 100)}% SUBMITTED`
                      : "NO LIMIT SET"}
                  </div>
                  {assignment.max_submissions > 0 && (
                    <div className="w-full bg-gray-200 h-2" style={{ borderRadius: "0" }}>
                      <div
                        className="bg-black h-2 transition-all duration-300"
                        style={{
                          width: `${(assignment.current_submissions / assignment.max_submissions) * 100}%`,
                          borderRadius: "0",
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 강사/관리자용 제출 목록 */}
        {isInstructor && (
          <div className="mt-8">
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-xl font-light tracking-widest uppercase">STUDENT SUBMISSIONS</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AssignmentSubmissionList assignmentId={assignment.id} currentUser={currentUser} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
