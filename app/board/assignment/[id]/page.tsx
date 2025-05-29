import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Users, Eye, Clock, FileText, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import AssignmentSubmissionForm from "@/components/board/assignment-submission-form"
import AssignmentSubmissionList from "@/components/board/assignment-submission-list"

interface AssignmentDetailPageProps {
  params: {
    id: string
  }
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const supabase = createServerComponentClient({ cookies })

  // 현재 사용자 정보 가져오기
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 과제 정보 조회
  const { data: assignment, error } = await supabase
    .from("assignments")
    .select(`
      *,
      author:users!author_id(name, email),
      instructor:users!instructor_id(name, email)
    `)
    .eq("id", params.id)
    .single()

  if (error || !assignment) {
    notFound()
  }

  // 사용자 권한 확인
  let currentUser = null
  let isInstructor = false

  if (user) {
    const { data: dbUser } = await supabase.from("users").select("*").eq("id", user.id).single()

    if (dbUser) {
      currentUser = dbUser
      isInstructor = ["admin", "instructor", "teacher"].includes(dbUser.role)
    }
  }

  const dueDate = new Date(assignment.due_date)
  const isOverdue = dueDate < new Date()
  const isSubmissionFull = assignment.current_submissions >= assignment.max_submissions

  const getLevelInfo = (level: string) => {
    const levelMap = {
      beginner: {
        label: "BASIC",
        color: "bg-white text-black border border-black",
      },
      intermediate: {
        label: "INTERMEDIATE",
        color: "bg-black text-white border border-black",
      },
      advanced: {
        label: "ADVANCED",
        color: "bg-gray-800 text-white border border-gray-800",
      },
    }
    return (
      levelMap[level as keyof typeof levelMap] || {
        label: level,
        color: "bg-gray-100 text-gray-800 border border-gray-300",
      }
    )
  }

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

        <div className="max-w-4xl mx-auto space-y-8">
          {/* 과제 헤더 */}
          <Card className="border-black" style={{ borderRadius: "0" }}>
            <CardHeader className="border-b border-black">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge
                      className={getLevelInfo(assignment.class_level).color + " tracking-widest"}
                      style={{ borderRadius: "0" }}
                    >
                      {getLevelInfo(assignment.class_level).label}
                    </Badge>
                    {isOverdue && (
                      <Badge
                        className="bg-red-100 text-red-800 border border-red-300 tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        OVERDUE
                      </Badge>
                    )}
                    {isSubmissionFull && (
                      <Badge
                        className="bg-orange-100 text-orange-800 border border-orange-300 tracking-widest"
                        style={{ borderRadius: "0" }}
                      >
                        FULL
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-light text-black mb-4 tracking-wide">{assignment.title}</h1>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span className="tracking-wide">{assignment.author?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span className="tracking-wide">{new Date(assignment.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span className="tracking-wide">{assignment.views} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {/* 과제 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-4 border border-gray-200" style={{ borderRadius: "0" }}>
                  <Clock className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-light tracking-widest uppercase text-gray-600">DUE DATE</p>
                  <p className="text-lg font-light tracking-wide">{dueDate.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 border border-gray-200" style={{ borderRadius: "0" }}>
                  <Users className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-light tracking-widest uppercase text-gray-600">SUBMISSIONS</p>
                  <p className="text-lg font-light tracking-wide">
                    {assignment.current_submissions} / {assignment.max_submissions}
                  </p>
                </div>
                <div className="text-center p-4 border border-gray-200" style={{ borderRadius: "0" }}>
                  <FileText className="h-6 w-6 mx-auto mb-2 text-gray-600" />
                  <p className="text-sm font-light tracking-widest uppercase text-gray-600">STATUS</p>
                  <p className="text-lg font-light tracking-wide">
                    {isOverdue ? "CLOSED" : isSubmissionFull ? "FULL" : "OPEN"}
                  </p>
                </div>
              </div>

              {/* 과제 내용 */}
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap tracking-wide font-light text-gray-800">{assignment.content}</div>
              </div>

              {/* 첨부파일 */}
              {assignment.attachment_url && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200" style={{ borderRadius: "0" }}>
                  <p className="text-sm font-light tracking-widest uppercase text-blue-800 mb-2">ATTACHMENT</p>
                  <a
                    href={assignment.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline tracking-wide"
                  >
                    {assignment.attachment_url.split("/").pop()}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 제출 섹션 */}
          {currentUser && !isInstructor && (
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-xl font-light tracking-widest uppercase">SUBMIT ASSIGNMENT</CardTitle>
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

          {/* 제출 목록 (강사/관리자만) */}
          {isInstructor && (
            <Card className="border-black" style={{ borderRadius: "0" }}>
              <CardHeader className="border-b border-black">
                <CardTitle className="text-xl font-light tracking-widest uppercase">SUBMISSIONS</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <AssignmentSubmissionList assignmentId={assignment.id} currentUser={currentUser} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
