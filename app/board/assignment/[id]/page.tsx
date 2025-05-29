import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { ArrowLeft, Calendar, FileText, Users } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import AssignmentSubmissionModal from "@/components/board/assignment-submission-modal"
import AssignmentSubmissionList from "@/components/board/assignment-submission-list"

interface AssignmentDetailPageProps {
  params: {
    id: string
  }
}

async function getAssignment(id: string) {
  const supabase = createServerComponentClient({ cookies })

  // 조회수 증가
  await supabase.rpc("increment_assignment_views", { assignment_id: id })

  // 과제 정보 조회 (필요한 필드만 선택)
  const { data: assignment, error } = await supabase
    .from("assignments")
    .select(`
      id, title, content, description, class_level, due_date, 
      max_submissions, current_submissions, views, created_at, updated_at, password,
      author:users!author_id(id, name, email),
      instructor:users!instructor_id(id, name, email)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("과제 조회 오류:", error)
    return null
  }

  return {
    ...assignment,
    has_password: !!assignment.password,
    password: undefined, // 클라이언트에 비밀번호 자체는 전송하지 않음
  }
}

async function getCurrentUser() {
  const supabase = createServerComponentClient({ cookies })

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: dbUser } = await supabase
      .from("users")
      .select("id, name, email, role, level")
      .eq("id", user.id)
      .single()

    return dbUser
  } catch (error) {
    console.error("사용자 정보 조회 오류:", error)
    return null
  }
}

export default async function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const assignment = await getAssignment(params.id)
  const currentUser = await getCurrentUser()

  if (!assignment) {
    notFound()
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

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/board"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO BOARD
          </Link>
        </div>

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

        {/* 제출 섹션 - 로그인 여부와 상관없이 제출 버튼 표시 */}
        <div className="mb-12">
          <h2 className="text-2xl font-light tracking-widest mb-6 uppercase">SUBMISSIONS</h2>

          <div className="bg-gray-50 p-6 mb-8 border border-gray-200">
            <h3 className="text-lg font-light tracking-widest mb-4 uppercase">SUBMIT YOUR ASSIGNMENT</h3>
            <AssignmentSubmissionModal
              assignmentId={params.id}
              currentUser={currentUser}
              isOverdue={isOverdue}
              maxSubmissions={assignment.max_submissions}
              currentSubmissions={assignment.current_submissions}
            />
          </div>

          {(isAdmin || isInstructor) && (
            <div className="mt-8">
              <h3 className="text-lg font-light tracking-widest mb-4 uppercase">ALL SUBMISSIONS</h3>
              <AssignmentSubmissionList assignmentId={params.id} currentUser={currentUser} />
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
