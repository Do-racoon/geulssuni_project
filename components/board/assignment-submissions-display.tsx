"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Download, FileText, MessageCircle, Send, User, Calendar, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth"

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
  author_id?: string
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
  const [deletingComment, setDeletingComment] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadCurrentUser()
    loadSubmissions()
  }, [assignmentId, refreshTrigger])

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser()
      if (user) {
        setCurrentUser(user)
        // 관리자 권한 확인
        setIsAdmin(user.role === "admin" || user.role === "instructor")
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

    if (!currentUser) {
      toast.error("댓글을 작성하려면 로그인이 필요합니다.")
      return
    }

    setCommentingOn(submissionId)

    try {
      const response = await fetch(`/api/assignments/submissions/${submissionId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          author_name: currentUser.name,
          author_id: currentUser.id,
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

  const handleDeleteComment = async (commentId: string, submissionId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return

    setDeletingComment(commentId)

    try {
      const response = await fetch(`/api/assignments/submissions/comments/${commentId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser?.id,
          is_admin: isAdmin,
        }),
      })

      if (response.ok) {
        // 댓글 삭제 후 해당 제출물의 댓글 새로고침
        const commentsResponse = await fetch(`/api/assignments/submissions/${submissionId}/comments`)
        if (commentsResponse.ok) {
          const comments = await commentsResponse.json()
          setSubmissions((prev) => prev.map((sub) => (sub.id === submissionId ? { ...sub, comments } : sub)))
        }

        toast.success("댓글이 삭제되었습니다.")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "댓글 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error)
      toast.error("댓글 삭제 중 오류가 발생했습니다.")
    } finally {
      setDeletingComment(null)
    }
  }

  const canDeleteComment = (comment: SubmissionComment) => {
    return isAdmin || comment.author_id === currentUser?.id
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
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light tracking-widest uppercase">SUBMISSIONS ({submissions.length})</h3>
        <div className="w-full">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {Array.from(new Set(submissions.map((s) => s.student_name))).map((studentName) => (
                <button
                  key={studentName}
                  className="whitespace-nowrap py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-light tracking-wider uppercase text-sm"
                >
                  {studentName}
                </button>
              ))}
              <button
                onClick={() => {
                  // 현재 사용자가 로그인되어 있는지 확인
                  if (!currentUser) {
                    toast.error("로그인이 필요합니다.")
                    return
                  }

                  // 파일 입력 요소 생성하여 직접 파일 선택
                  const fileInput = document.createElement("input")
                  fileInput.type = "file"
                  fileInput.accept = ".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                  fileInput.onchange = async (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      // 파일 크기 체크
                      if (file.size > 10 * 1024 * 1024) {
                        toast.error("파일 크기는 10MB를 초과할 수 없습니다.")
                        return
                      }

                      try {
                        setUploading(true)
                        // 파일 업로드
                        const formData = new FormData()
                        formData.append("file", file)

                        const uploadResponse = await fetch("/api/upload", {
                          method: "POST",
                          body: formData,
                        })

                        if (!uploadResponse.ok) {
                          throw new Error("파일 업로드 실패")
                        }

                        const { url: fileUrl } = await uploadResponse.json()

                        // 과제 제출
                        const submitResponse = await fetch(`/api/assignments/${assignmentId}/submissions`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            studentId: currentUser.id,
                            studentName: currentUser.name,
                            fileUrl,
                            fileName: file.name,
                          }),
                        })

                        if (submitResponse.ok) {
                          toast.success("과제가 성공적으로 제출되었습니다!")
                          // 제출 목록 새로고침
                          loadSubmissions()
                        } else {
                          const errorData = await submitResponse.json()
                          toast.error(errorData.error || "제출에 실패했습니다.")
                        }
                      } catch (error) {
                        console.error("제출 오류:", error)
                        toast.error("제출 중 오류가 발생했습니다.")
                      } finally {
                        setUploading(false)
                      }
                    }
                  }
                  fileInput.click()
                }}
                className="whitespace-nowrap py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-light tracking-wider uppercase text-sm hover:bg-blue-50 cursor-pointer"
              >
                + ADD SUBMISSION
              </button>
            </nav>
          </div>
        </div>
      </div>

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
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium tracking-wider text-blue-600">
                            {comment.author_name}
                          </span>
                          {isAdmin && comment.author_id && (
                            <span className="text-xs text-gray-400">({comment.author_id.slice(0, 8)}...)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                          {canDeleteComment(comment) && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border border-black rounded-none">
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComment(comment.id, submission.id)}
                                  disabled={deletingComment === comment.id}
                                  className="text-red-600 focus:text-red-600 tracking-wider font-light"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  {deletingComment === comment.id ? "DELETING..." : "DELETE"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 font-light">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* 새 댓글 작성 */}
              <div className="space-y-2">
                {currentUser ? (
                  <div className="text-sm text-gray-600 font-light">
                    댓글을 <span className="font-medium text-blue-600">{currentUser.name}</span>으로 작성합니다
                    {isAdmin && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded">ADMIN</span>}
                  </div>
                ) : (
                  <div className="text-sm text-red-600 font-light">댓글을 작성하려면 로그인이 필요합니다.</div>
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
                    placeholder={currentUser ? `${currentUser.name}으로 댓글 작성...` : "로그인 후 댓글을 작성하세요"}
                    className="flex-1 border-gray-300 min-h-[60px]"
                    style={{ borderRadius: "0" }}
                    disabled={!currentUser}
                  />
                  <Button
                    onClick={() => handleAddComment(submission.id)}
                    disabled={!newComments[submission.id]?.trim() || commentingOn === submission.id || !currentUser}
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
