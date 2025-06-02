"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, CheckCircle, Clock, User, FileText } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface AssignmentSubmissionListProps {
  assignmentId: string
  currentUser: any
}

export default function AssignmentSubmissionList({ assignmentId, currentUser }: AssignmentSubmissionListProps) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    loadSubmissions()
  }, [assignmentId])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
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
      })

      if (response.ok) {
        const updatedSubmission = await response.json()
        setSubmissions(
          submissions.map((submission) => (submission.id === submissionId ? updatedSubmission : submission)),
        )
        toast.success("검수 상태가 변경되었습니다.")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "검수 상태를 변경할 수 없습니다.")
      }
    } catch (error) {
      console.error("검수 상태 업데이트 오류:", error)
      toast.error("검수 상태 변경 중 오류가 발생했습니다.")
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 font-light tracking-wider">LOADING SUBMISSIONS...</p>
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
          RETRY
        </Button>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200">
        <p className="text-gray-500 font-light tracking-wider">NO SUBMISSIONS YET</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <div key={submission.id} className="border border-gray-200 p-6 bg-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <h3 className="font-light text-lg">{submission.student_name}</h3>
                {submission.student?.email && (
                  <span className="text-sm text-gray-500 font-light">({submission.student.email})</span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-light">
                Submitted: {new Date(submission.submitted_at).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {submission.is_checked ? (
                <Badge className="bg-green-50 text-green-700 border border-green-200 text-xs font-light tracking-wider">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  CHECKED
                </Badge>
              ) : (
                <Badge className="bg-gray-100 text-gray-700 border border-gray-200 text-xs font-light tracking-wider">
                  <Clock className="h-3 w-3 mr-1" />
                  PENDING
                </Badge>
              )}

              <Button
                onClick={() => handleCheckToggle(submission.id)}
                variant="outline"
                size="sm"
                className="text-xs border-gray-300 hover:border-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider"
              >
                {submission.is_checked ? "MARK PENDING" : "MARK CHECKED"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 border border-gray-200">
            <FileText className="h-5 w-5 text-gray-600" />
            <a
              href={submission.file_url}
              download={submission.file_name}
              className="text-blue-600 hover:underline tracking-wide flex items-center"
              target="_blank"
              rel="noopener noreferrer"
            >
              {submission.file_name}
              <Download className="h-4 w-4 ml-1" />
            </a>
          </div>

          {submission.comment && (
            <div className="mb-4">
              <h4 className="text-sm font-light tracking-wider uppercase text-gray-500 mb-2">STUDENT COMMENT:</h4>
              <div className="p-3 bg-gray-50 border border-gray-200 whitespace-pre-wrap text-gray-700 font-light">
                {submission.comment}
              </div>
            </div>
          )}

          {submission.feedback && (
            <div>
              <h4 className="text-sm font-light tracking-wider uppercase text-gray-500 mb-2">INSTRUCTOR FEEDBACK:</h4>
              <div className="p-3 bg-blue-50 border border-blue-200 whitespace-pre-wrap text-gray-700 font-light">
                {submission.feedback}
              </div>
            </div>
          )}

          {submission.is_checked && submission.checked_by_user && (
            <div className="mt-4 text-sm text-gray-500 font-light">
              Checked by: {submission.checked_by_user.name} on {new Date(submission.checked_at).toLocaleString()}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
