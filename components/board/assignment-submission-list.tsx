"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Download, CheckCircle, XCircle, RefreshCw, MessageSquare } from "lucide-react"
import { toast } from "sonner"

interface Submission {
  id: string
  assignment_id: string
  student_id: string
  student_name: string
  file_url: string
  file_name?: string
  submitted_at: string
  is_checked: boolean
  checked_by?: string
  checked_at?: string
  feedback?: string
}

interface AssignmentSubmissionListProps {
  assignmentId: string
  isInstructor: boolean
  currentUserId: string
}

export default function AssignmentSubmissionList({
  assignmentId,
  isInstructor,
  currentUserId,
}: AssignmentSubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [submittingFeedback, setSubmittingFeedback] = useState<Record<string, boolean>>({})

  useEffect(() => {
    loadSubmissions()
  }, [assignmentId])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)

        // 피드백 초기화
        const initialFeedback: Record<string, string> = {}
        data.forEach((submission: Submission) => {
          initialFeedback[submission.id] = submission.feedback || ""
        })
        setFeedback(initialFeedback)

        setError(null)
      } else {
        const errorText = await response.text()
        setError(`API 오류 (${response.status}): ${errorText}`)
      }
    } catch (error) {
      console.error("제출 목록 로딩 오류:", error)
      setError(`로딩 오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckToggle = async (submissionId: string) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/check`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback[submissionId],
        }),
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map((sub) => (sub.id === submissionId ? updatedSubmission : sub)))
        toast.success(`제출물 상태가 ${updatedSubmission.is_checked ? "확인됨" : "미확인"}으로 변경되었습니다.`)
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "상태를 변경할 수 없습니다.")
      }
    } catch (error) {
      console.error("상태 업데이트 오류:", error)
      toast.error("상태 변경 중 오류가 발생했습니다.")
    }
  }

  const handleFeedbackSubmit = async (submissionId: string) => {
    setSubmittingFeedback((prev) => ({ ...prev, [submissionId]: true }))
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/feedback`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: feedback[submissionId],
        }),
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(submissions.map((sub) => (sub.id === submissionId ? updatedSubmission : sub)))
        toast.success("피드백이 성공적으로 저장되었습니다.")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "피드백을 저장할 수 없습니다.")
      }
    } catch (error) {
      console.error("피드백 저장 오류:", error)
      toast.error("피드백 저장 중 오류가 발생했습니다.")
    } finally {
      setSubmittingFeedback((prev) => ({ ...prev, [submissionId]: false }))
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-6"></div>
        <p className="text-gray-600 font-light tracking-wider">LOADING SUBMISSIONS...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6">
        <p className="text-red-700 mb-4 font-light">{error}</p>
        <Button
          onClick={loadSubmissions}
          variant="outline"
          size="sm"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          RETRY
        </Button>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-200">
        <p className="text-gray-500 font-light tracking-wider text-lg">NO SUBMISSIONS YET</p>
      </div>
    )
  }

  // 강사는 모든 제출물을 볼 수 있고, 학생은 자신의 제출물만 볼 수 있음
  const filteredSubmissions = isInstructor
    ? submissions
    : submissions.filter((submission) => submission.student_id === currentUserId)

  if (filteredSubmissions.length === 0) {
    return (
      <div className="text-center py-16 border border-gray-200">
        <p className="text-gray-500 font-light tracking-wider text-lg">
          {isInstructor ? "NO SUBMISSIONS YET" : "YOU HAVEN'T SUBMITTED THIS ASSIGNMENT YET"}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* 제출 목록 */}
      <div className="space-y-6">
        {filteredSubmissions.map((submission) => (
          <div
            key={submission.id}
            className="border border-gray-200 hover:border-gray-300 transition-colors"
            style={{ borderRadius: "0" }}
          >
            <div className="p-6">
              {/* 헤더 */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Badge
                    className={`${
                      submission.is_checked ? "bg-black text-white" : "bg-gray-200 text-gray-800"
                    } text-xs font-light tracking-wider`}
                    style={{ borderRadius: "0" }}
                  >
                    {submission.is_checked ? "CHECKED" : "PENDING"}
                  </Badge>
                  <span className="font-light tracking-wide">{submission.student_name}</span>
                </div>
                <div className="text-sm text-gray-500 font-light">
                  {new Date(submission.submitted_at).toLocaleDateString()}{" "}
                  {new Date(submission.submitted_at).toLocaleTimeString()}
                </div>
              </div>

              {/* 파일 */}
              <div
                className="flex items-center gap-3 mb-6 p-3 bg-gray-50 border border-gray-200"
                style={{ borderRadius: "0" }}
              >
                <FileText className="h-5 w-5 text-gray-600" />
                <div className="flex-grow">
                  <p className="font-light tracking-wide">{submission.file_name || "Submitted File"}</p>
                </div>
                <a
                  href={submission.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                >
                  <Download className="h-4 w-4" />
                  <span className="text-sm font-light tracking-wider">DOWNLOAD</span>
                </a>
              </div>

              {/* 피드백 섹션 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-light tracking-widest uppercase text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  FEEDBACK
                </div>

                {isInstructor ? (
                  <div className="space-y-3">
                    <Textarea
                      value={feedback[submission.id] || ""}
                      onChange={(e) => setFeedback((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                      placeholder="Add feedback for this submission..."
                      className="resize-none border-gray-300 focus:border-black focus:ring-0 font-light"
                      style={{ borderRadius: "0" }}
                    />
                    <div className="flex justify-between">
                      <Button
                        onClick={() => handleCheckToggle(submission.id)}
                        variant="outline"
                        className={`${
                          submission.is_checked
                            ? "border-gray-300 text-gray-600 hover:bg-gray-100"
                            : "border-black text-black hover:bg-black hover:text-white"
                        } tracking-widest uppercase font-light`}
                        style={{ borderRadius: "0" }}
                      >
                        {submission.is_checked ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            MARK AS UNCHECKED
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            MARK AS CHECKED
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleFeedbackSubmit(submission.id)}
                        disabled={submittingFeedback[submission.id]}
                        className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
                        style={{ borderRadius: "0" }}
                      >
                        {submittingFeedback[submission.id] ? "SAVING..." : "SAVE FEEDBACK"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 border border-gray-200 font-light" style={{ borderRadius: "0" }}>
                    {submission.feedback ? (
                      <div className="whitespace-pre-wrap">{submission.feedback}</div>
                    ) : (
                      <p className="text-gray-500 italic">No feedback provided yet.</p>
                    )}
                  </div>
                )}

                {/* 체크 정보 */}
                {submission.is_checked && submission.checked_at && (
                  <div className="text-sm text-gray-500 font-light">
                    Checked on: {new Date(submission.checked_at).toLocaleDateString()}{" "}
                    {new Date(submission.checked_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-center">
        <Button
          onClick={loadSubmissions}
          variant="outline"
          className="border-black text-black hover:bg-black hover:text-white tracking-widest uppercase font-light"
          style={{ borderRadius: "0" }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          REFRESH SUBMISSIONS
        </Button>
      </div>
    </div>
  )
}
