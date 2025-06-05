"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Download,
  FileText,
  MessageCircle,
  Send,
  User,
  Calendar,
  Trash2,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  LogIn,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { getCurrentUser } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

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
  refreshTrigger?: number
}

interface CurrentUser {
  id: string
  name: string
  email: string
  role: string
}

export default function AssignmentSubmissionsDisplay({
  assignmentId,
  refreshTrigger = 0,
}: AssignmentSubmissionsDisplayProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const [commentingOn, setCommentingOn] = useState<string | null>(null)
  const [deletingComment, setDeletingComment] = useState<string | null>(null)
  const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)

  const [submissionForm, setSubmissionForm] = useState({
    studentName: "",
    comment: "",
    file: null as File | null,
  })

  useEffect(() => {
    loadCurrentUser()
    loadSubmissions()
  }, [assignmentId, refreshTrigger])

  const loadCurrentUser = async () => {
    try {
      setAuthLoading(true)
      console.log("🔍 Loading current user...")

      // 먼저 Supabase 세션 직접 확인
      const supabase = createClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("📋 Session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError,
      })

      if (!session) {
        console.log("❌ No session found")
        setCurrentUser(null)
        setIsAdmin(false)
        return
      }

      // getCurrentUser 함수 사용
      const user = await getCurrentUser()
      console.log("👤 Current user from getCurrentUser:", user)

      if (user) {
        setCurrentUser(user)
        const adminStatus = user.role === "admin" || user.role === "instructor"
        setIsAdmin(adminStatus)
        console.log("🔐 Admin status:", adminStatus, "Role:", user.role)
      } else {
        // getCurrentUser가 실패한 경우 직접 DB에서 조회
        console.log("⚠️ getCurrentUser failed, trying direct DB query...")

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id, name, email, role")
          .eq("id", session.user.id)
          .single()

        if (userData) {
          console.log("✅ User found via direct query:", userData)
          setCurrentUser(userData)
          const adminStatus = userData.role === "admin" || userData.role === "instructor"
          setIsAdmin(adminStatus)
        } else if (session.user.email) {
          // 이메일로 재시도
          const { data: userByEmail, error: emailError } = await supabase
            .from("users")
            .select("id, name, email, role")
            .eq("email", session.user.email)
            .single()

          if (userByEmail) {
            console.log("✅ User found via email:", userByEmail)
            setCurrentUser(userByEmail)
            const adminStatus = userByEmail.role === "admin" || userByEmail.role === "instructor"
            setIsAdmin(adminStatus)
          } else {
            console.log("❌ No user found in database")
            setCurrentUser(null)
            setIsAdmin(false)
          }
        }
      }
    } catch (error) {
      console.error("❌ Error loading user:", error)
      setCurrentUser(null)
      setIsAdmin(false)
    } finally {
      setAuthLoading(false)
    }
  }

  const loadSubmissions = async () => {
    try {
      setLoading(true)

      // /public 경로 제거하고 일반 submissions 경로 사용
      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        cache: "no-store",
      })

      // 응답 상태 확인
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`)

        // HTML 응답인지 확인
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("text/html")) {
          console.error("Received HTML instead of JSON - API endpoint may not exist")
          toast.error("API 엔드포인트를 찾을 수 없습니다.")
          return
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // JSON 파싱 시도
      const text = await response.text()
      if (!text) {
        console.log("Empty response received")
        setSubmissions([])
        return
      }

      try {
        const data = JSON.parse(text)
        setSubmissions(Array.isArray(data) ? data : [])
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Response text:", text.substring(0, 200))
        toast.error("서버 응답을 파싱할 수 없습니다.")
      }
    } catch (error) {
      console.error("제출 목록 로딩 오류:", error)
      toast.error("제출 목록을 불러오는데 실패했습니다.")
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

  const handleDeleteSubmission = async (submissionId: string) => {
    console.log("🗑️ Delete submission clicked:", { submissionId, isAdmin, currentUser })

    if (!isAdmin) {
      toast.error("관리자만 제출물을 삭제할 수 있습니다.")
      return
    }

    if (!confirm("이 제출물을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return

    setDeletingSubmission(submissionId)

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          admin_id: currentUser?.id,
          is_admin: isAdmin,
        }),
      })

      if (response.ok) {
        // 제출물 목록에서 삭제된 항목 제거
        setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId))
        toast.success("제출물이 삭제되었습니다.")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "제출물 삭제에 실패했습니다.")
      }
    } catch (error) {
      console.error("제출물 삭제 오류:", error)
      toast.error("제출물 삭제 중 오류가 발생했습니다.")
    } finally {
      setDeletingSubmission(null)
    }
  }

  const canDeleteComment = (comment: SubmissionComment) => {
    return isAdmin || comment.author_id === currentUser?.id
  }

  const handleSubmitAssignment = async () => {
    if (!submissionForm.studentName.trim()) {
      toast.error("이름을 입력해주세요.")
      return
    }

    if (!submissionForm.file) {
      toast.error("파일을 선택해주세요.")
      return
    }

    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("studentName", submissionForm.studentName.trim())
      formData.append("comment", submissionForm.comment.trim())
      formData.append("file", submissionForm.file)

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("과제가 성공적으로 제출되었습니다!")
        setSubmissionForm({ studentName: "", comment: "", file: null })
        // 파일 입력 초기화
        const fileInput = document.getElementById("file-input") as HTMLInputElement
        if (fileInput) fileInput.value = ""
        // 제출 목록 새로고침
        loadSubmissions()
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("제출 오류:", error)
      toast.error("제출 중 오류가 발생했습니다.")
    } finally {
      setUploading(false)
    }
  }

  const handleLoginRedirect = () => {
    window.location.href = "/login"
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-black border-t-transparent mx-auto mb-4"></div>
        <p className="text-gray-500 font-light tracking-wider">LOADING SUBMISSIONS...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light tracking-widest uppercase">SUBMISSIONS ({submissions.length})</h3>

        {/* 인증 상태 표시 */}
        <div className="flex items-center gap-2">
          {authLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full" />
              인증 확인 중...
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">{currentUser.name}</span>
              {isAdmin && <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">ADMIN</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600 text-sm">로그인 필요</span>
              <Button onClick={handleLoginRedirect} size="sm" variant="outline" className="text-xs">
                <LogIn className="h-3 w-3 mr-1" />
                로그인
              </Button>
            </div>
          )}

          <Button onClick={loadCurrentUser} variant="outline" size="sm" className="text-xs" disabled={authLoading}>
            <RefreshCw className={`h-3 w-3 mr-1 ${authLoading ? "animate-spin" : ""}`} />
            새로고침
          </Button>
        </div>
      </div>

      {/* 기존 제출물 카드들 */}
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

              {/* 관리자용 삭제 버튼 */}
              {isAdmin && (
                <Button
                  onClick={() => handleDeleteSubmission(submission.id)}
                  disabled={deletingSubmission === submission.id}
                  className="bg-red-600 text-white hover:bg-red-700 tracking-widest uppercase font-light px-4"
                  style={{ borderRadius: "0" }}
                  type="button"
                >
                  {deletingSubmission === submission.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      <span className="font-light tracking-wider">삭제</span>
                    </>
                  )}
                </Button>
              )}
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

      {/* 새 제출 카드 - 항상 표시 */}
      <Card className="border border-dashed border-gray-300 bg-gray-50" style={{ borderRadius: "0" }}>
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h4 className="text-lg font-light tracking-widest uppercase mb-6">ADD NEW SUBMISSION</h4>

            <div className="max-w-md mx-auto space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-light tracking-wider uppercase text-gray-700">YOUR NAME *</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  style={{ borderRadius: "0" }}
                  value={submissionForm.studentName}
                  onChange={(e) => setSubmissionForm((prev) => ({ ...prev, studentName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-light tracking-wider uppercase text-gray-700">FILE *</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-input"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 10 * 1024 * 1024) {
                          toast.error("파일 크기는 10MB를 초과할 수 없습니다.")
                          return
                        }
                        setSubmissionForm((prev) => ({ ...prev, file }))
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-left"
                    style={{ borderRadius: "0" }}
                  >
                    {submissionForm.file ? submissionForm.file.name : "Choose file..."}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Supported: PDF, DOC, DOCX, TXT, ZIP, RAR, JPG, PNG (Max 10MB)</p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-light tracking-wider uppercase text-gray-700">
                  COMMENT (OPTIONAL)
                </label>
                <textarea
                  placeholder="Add any comments about your submission..."
                  className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  style={{ borderRadius: "0" }}
                  value={submissionForm.comment}
                  onChange={(e) => setSubmissionForm((prev) => ({ ...prev, comment: e.target.value }))}
                />
              </div>

              <Button
                onClick={handleSubmitAssignment}
                disabled={uploading || !submissionForm.studentName.trim() || !submissionForm.file}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 tracking-widest uppercase font-light py-3"
                style={{ borderRadius: "0" }}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2 inline-block" />
                    SUBMITTING...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2 inline" />
                    SUBMIT ASSIGNMENT
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 관리자 전용 안내 메시지 */}
      {isAdmin && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <p className="text-sm text-yellow-700">
            <span className="font-medium">관리자 권한:</span> 제출물 삭제 버튼이 각 제출물 카드의 오른쪽 상단에
            표시됩니다. 삭제된 제출물은 복구할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  )
}
