"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, FileText, Calendar, User, Download } from "lucide-react"
import { toast } from "sonner"

interface Submission {
  id: string
  student_name: string
  file_name: string
  file_url: string
  submitted_at: string
  is_checked: boolean
  checked_by: string | null
  checked_at: string | null
}

interface AssignmentSubmissionListProps {
  assignmentId: string
  currentUser: any
}

export default function AssignmentSubmissionList({ assignmentId, currentUser }: AssignmentSubmissionListProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingIds, setCheckingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchSubmissions()
  }, [assignmentId])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`)
      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("제출 목록 조회 오류:", error)
      toast.error("제출 목록을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleCheckToggle = async (submissionId: string, currentChecked: boolean) => {
    setCheckingIds((prev) => new Set(prev).add(submissionId))

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}/check`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isChecked: !currentChecked,
          checkedBy: currentUser.id,
        }),
      })

      if (response.ok) {
        setSubmissions((prev) =>
          prev.map((sub) =>
            sub.id === submissionId
              ? {
                  ...sub,
                  is_checked: !currentChecked,
                  checked_by: !currentChecked ? currentUser.id : null,
                  checked_at: !currentChecked ? new Date().toISOString() : null,
                }
              : sub,
          ),
        )
        toast.success(!currentChecked ? "체크 완료" : "체크 해제")
      } else {
        toast.error("체크 상태 변경에 실패했습니다.")
      }
    } catch (error) {
      console.error("체크 상태 변경 오류:", error)
      toast.error("오류가 발생했습니다.")
    } finally {
      setCheckingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(submissionId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 tracking-wide">LOADING SUBMISSIONS...</p>
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 border border-gray-200">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 tracking-widest uppercase">NO SUBMISSIONS YET</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="border border-black p-6 bg-white hover:bg-gray-50 transition-colors"
          style={{ borderRadius: "0" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="font-light tracking-wide text-lg">{submission.student_name}</span>
                </div>
                <Badge
                  className={`tracking-widest ${
                    submission.is_checked
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-800 border border-gray-300"
                  }`}
                  style={{ borderRadius: "0" }}
                >
                  {submission.is_checked ? "CHECKED" : "PENDING"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <a
                    href={submission.file_url}
                    download={submission.file_name}
                    className="hover:underline tracking-wide flex items-center text-blue-600"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {submission.file_name}
                    <Download className="h-4 w-4 ml-1" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="tracking-wide">{new Date(submission.submitted_at).toLocaleString()}</span>
                </div>
              </div>

              {submission.is_checked && submission.checked_at && (
                <p className="text-xs text-green-600 tracking-wide">
                  CHECKED ON: {new Date(submission.checked_at).toLocaleString()}
                </p>
              )}
            </div>

            <Button
              onClick={() => handleCheckToggle(submission.id, submission.is_checked)}
              disabled={checkingIds.has(submission.id)}
              variant="outline"
              className={`border-black tracking-widest uppercase font-light ${
                submission.is_checked
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-white text-black hover:bg-black hover:text-white"
              }`}
              style={{ borderRadius: "0" }}
            >
              {checkingIds.has(submission.id) ? (
                "UPDATING..."
              ) : submission.is_checked ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  UNCHECK
                </>
              ) : (
                <>
                  <Circle className="h-4 w-4 mr-2" />
                  CHECK
                </>
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
