"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, MessageCircle, Send, User, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Submission {
  id: string
  student_name: string
  file_name: string
  file_url: string
  comment?: string
  submitted_at: string
  comments?: SubmissionComment[]
}

interface SubmissionComment {
  id: string
  author_name: string
  content: string
  created_at: string
}

interface AssignmentSubmissionsDisplayProps {
  assignmentId: string
  refreshTrigger: number
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function AssignmentSubmissionsDisplay({
  assignmentId,
  refreshTrigger,
}: AssignmentSubmissionsDisplayProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    loadCurrentUser()
    loadSubmissions()
  }, [assignmentId, refreshTrigger])

  const loadCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth-status", {
        cache: "no-store",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.user) {
          setCurrentUser(data.user)
        }
      }
    } catch (error) {
      console.error("사용자 정보 로딩 오류:", error)
    }
  }

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/public`, {
        cache: "no-store",
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data)
      }
    } catch (error) {
      console.error("제출 목록 로딩 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddComment = async (submissionId: string) => {
    const content = newComments[submissionId]?.trim()
    if (!content) return

    setCommentingOn(submissionId)

    try {
      const authorName = currentUser?.name || "Anonymous"
      const authorId = currentUser?.id || null

      const response = await fetch(`/api/assignments/submissions/${submissionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          author_name: authorName,
          author_id: authorId,
        }),
      })

      if (response.ok) {
        setNewComments((prev) => ({ ...prev, [submissionId]: "" }))

        // 댓글 추가 후 해당 제출물의 댓글만 새로고침
        const commentsResponse = await fetch(`/api/assignments/submissions/${submissionId}/comments`)
        if (commentsResponse.ok) {
          const comments = await commentsResponse.json()
          setSubmissions((prev) => prev.map((sub) => (sub.id === submissionId ? { ...sub, comments } : sub)))
        }

        toast.success("댓글이 추가되었습니다.")
      } else {
        toast.error("댓글 추가에 실패했습니다.")
      }
    } catch (error) {
      console.error("댓글 추가 오류:", error)
      toast.error("댓글 추가 중 오류가 발생했습니다.")
    } finally {
      setCommentingOn(null)
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

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 border border-gray-200">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-light tracking-wider">NO SUBMISSIONS YET</p>
        <p className="text-sm text-gray-400 font-light">Be the first to submit!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-light tracking-widest uppercase mb-4">SUBMISSIONS ({submissions.length})</h3>

      {submissions.map((submission) => (
        <Card key={submission.id} className="border border-gray-200" style={{ borderRadius: "0" }}>
          <CardContent className="p-6">
            {/* 제출자 정보 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 border border-gray-300 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-light text-lg tracking-wider">{submission.student_name}</h4>
                  <div className="flex items-center text-sm text-gray-500 font-light">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(submission.submitted_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* 파일 다운로드 */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200">
              <a
                href={submission.file_url}
                download={submission.file_name}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText className="h-5 w-5 mr-2" />
                <span className="tracking-wide">{submission.file_name}</span>
                <Download className="h-4 w-4 ml-2" />
              </a>
            </div>

            {/* 코멘트 */}
            {submission.comment && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200">
                <h5 className="text-sm font-light tracking-wider uppercase text-gray-600 mb-2">STUDENT COMMENT:</h5>
                <p className="text-gray-700 font-light whitespace-pre-wrap">{submission.comment}</p>
              </div>
            )}

            {/* 댓글 섹션 */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center mb-3">
                <MessageCircle className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-sm font-light tracking-wider uppercase text-gray-600">
                  COMMENTS ({submission.comments?.length || 0})
                </span>
              </div>

              {/* 기존 댓글들 */}
              {submission.comments && submission.comments.length > 0 && (
                <div className="space-y-3 mb-4">
                  {submission.comments.map((comment) => (
                    <div key={comment.id} className="bg-gray-50 p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium tracking-wider text-blue-600">{comment.author_name}</span>
                        <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-700 font-light">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 댓글 작성 */}
              <div className="space-y-2">
                {currentUser && (
                  <div className="text-sm text-gray-600 font-light">
                    댓글을 <span className="font-medium text-blue-600">{currentUser.name}</span>으로 작성합니다
                  </div>
                )}
                <div className="flex gap-2">
                  <Textarea
                    value={newComments[submission.id] || ""}
                    onChange={(e) =>
                      setNewComments((prev) => ({
                        ...prev,
                        [submission.id]: e.target.value,
                      }))
                    }
                    placeholder={currentUser ? `${currentUser.name}으로 댓글 작성...` : "댓글을 작성하세요..."}
                    className="flex-1 border-gray-300 min-h-[60px]"
                    style={{ borderRadius: "0" }}
                  />
                  <Button
                    onClick={() => handleAddComment(submission.id)}
                    disabled={!newComments[submission.id]?.trim() || commentingOn === submission.id}
                    className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light px-4"
                    style={{ borderRadius: "0" }}
                  >
                    {commentingOn === submission.id ? (
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
