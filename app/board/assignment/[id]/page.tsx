import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Users, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "과제 상세",
  description: "과제 상세 페이지입니다.",
}

async function getAssignment(id: string) {
  const supabase = createServerComponentClient({ cookies })

  try {
    // assignments 테이블에서 과제 정보 가져오기
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

export default async function AssignmentPage({ params }: { params: { id: string } }) {
  const assignment = await getAssignment(params.id)

  if (!assignment) {
    notFound()
  }

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

  const isOverdue = new Date(assignment.due_date) < new Date()
  const daysUntilDue = Math.ceil(
    (new Date(assignment.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button asChild variant="outline">
            <Link href="/board">← 게시판으로 돌아가기</Link>
          </Button>
        </div>

        {/* 과제 정보 카드 */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{assignment.title}</CardTitle>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>강사: {assignment.author?.name || "알 수 없음"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>등록일: {new Date(assignment.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getLevelColor(assignment.class_level)}>{getLevelText(assignment.class_level)}</Badge>
                {assignment.is_completed && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    완료됨
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none mb-6">
              <p className="text-gray-700 leading-relaxed">{assignment.description}</p>
            </div>

            {/* 마감일 정보 */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">마감일</span>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                    {new Date(assignment.due_date).toLocaleDateString()}{" "}
                    {new Date(assignment.due_date).toLocaleTimeString()}
                  </div>
                  <div
                    className={`text-sm ${isOverdue ? "text-red-500" : daysUntilDue <= 3 ? "text-orange-500" : "text-gray-500"}`}
                  >
                    {isOverdue
                      ? `${Math.abs(daysUntilDue)}일 지남`
                      : daysUntilDue === 0
                        ? "오늘 마감"
                        : `${daysUntilDue}일 남음`}
                  </div>
                </div>
              </div>
            </div>

            {/* 제출 현황 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">제출 현황</span>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-900">
                    {assignment.submissions_count} / {assignment.total_students}
                  </div>
                  <div className="text-sm text-blue-600">
                    {assignment.total_students > 0
                      ? `${Math.round((assignment.submissions_count / assignment.total_students) * 100)}% 완료`
                      : "학생 없음"}
                  </div>
                </div>
              </div>
              {assignment.total_students > 0 && (
                <div className="mt-3">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(assignment.submissions_count / assignment.total_students) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 과제 제출 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>과제 제출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">과제 제출 기능은 준비 중입니다.</p>
              <Button disabled>과제 제출하기</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
