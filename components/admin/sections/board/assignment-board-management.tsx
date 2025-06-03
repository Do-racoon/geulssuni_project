"use client"

import { useState, useEffect } from "react"
import { Eye, Lock, Unlock, Calendar, Edit, Trash2, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface AssignmentBoardManagementProps {
  onAddPost: () => void
  onEditPost: (postId: string) => void
}

interface Assignment {
  id: string
  title: string
  description?: string
  created_at: string
  updated_at: string
  instructor_id: string
  instructor?: {
    name: string
  }
  password?: string | null
  due_date?: string | null
  max_submissions?: number
  current_submissions?: number
  class_level?: string
  views?: number
}

interface Submission {
  id: string
  student_name: string
  file_url: string
  file_name: string
  comment: string
  created_at: string
  submitted_at: string
}

export default function AssignmentBoardManagement({ onAddPost, onEditPost }: AssignmentBoardManagementProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loadingSubmissions, setLoadingSubmissions] = useState(false)
  const [submissionsError, setSubmissionsError] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingSubmissionId, setDeletingSubmissionId] = useState<string | null>(null)
  const [deletingSubmission, setDeletingSubmission] = useState(false)

  const loadAssignments = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/assignments-table")

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      setAssignments(data)
    } catch (err) {
      setError(`과제 목록 로딩 오류: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSubmissions = async (assignmentId: string) => {
    try {
      setLoadingSubmissions(true)
      setSubmissionsError(null)

      const response = await fetch(`/api/assignments/${assignmentId}/submissions`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setSubmissions(data)
    } catch (err) {
      setSubmissionsError(`제출 목록 로딩 오류: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoadingSubmissions(false)
    }
  }

  const handleDeleteSubmission = async (submissionId: string, assignmentId: string) => {
    try {
      setDeletingSubmission(true)

      const response = await fetch(`/api/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setSubmissions(submissions.filter((sub) => sub.id !== submissionId))

      if (selectedAssignment) {
        setSelectedAssignment({
          ...selectedAssignment,
          current_submissions: (selectedAssignment.current_submissions || 0) - 1,
        })
      }

      setAssignments(
        assignments.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, current_submissions: (assignment.current_submissions || 0) - 1 }
            : assignment,
        ),
      )

      toast({
        title: "제출물 삭제 완료",
        description: "제출물이 성공적으로 삭제되었습니다.",
      })
    } catch (err) {
      toast({
        title: "제출물 삭제 오류",
        description: `${err instanceof Error ? err.message : String(err)}`,
        variant: "destructive",
      })
    } finally {
      setDeletingSubmission(false)
      setDeleteDialogOpen(false)
      setDeletingSubmissionId(null)
    }
  }

  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    loadSubmissions(assignment.id)
    setDetailsOpen(true)
  }

  const handleEditClick = (assignmentId: string) => {
    onEditPost(assignmentId)
  }

  useEffect(() => {
    loadAssignments()
  }, [])

  const formatDate = (dateString: string) => {
    if (!dateString) return "없음"
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">과제 게시판 관리</h3>
        <Button onClick={onAddPost}>새 과제 추가</Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">오류 발생</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={loadAssignments}>
            다시 시도
          </Button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">과제 목록을 불러오는 중...</p>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2">등록된 과제가 없습니다.</p>
              <Button onClick={onAddPost} variant="outline" className="mt-4">
                새 과제 추가
              </Button>
            </div>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-medium">{assignment.title}</h4>
                        <div className="flex gap-1">
                          {assignment.password ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Protected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1 bg-green-50">
                              <Unlock className="h-3 w-3" /> Public
                            </Badge>
                          )}
                          {assignment.class_level && <Badge>{assignment.class_level}</Badge>}
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>마감일: {assignment.due_date ? formatDate(assignment.due_date) : "없음"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>조회수: {assignment.views || 0}</span>
                        </div>
                        <div>
                          <span>
                            제출: {assignment.current_submissions || 0} / {assignment.max_submissions || "∞"}
                          </span>
                        </div>
                        <div>
                          <span>작성자: {assignment.instructor?.name || "Unknown"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(assignment)}>
                        상세 보기
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditClick(assignment.id)}>
                        수정
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* 과제 상세 모달 */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>과제 상세 정보</DialogTitle>
          </DialogHeader>

          {selectedAssignment && (
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">과제 정보</TabsTrigger>
                <TabsTrigger value="submissions">제출물 ({selectedAssignment.current_submissions || 0})</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">제목</h4>
                    <p>{selectedAssignment.title}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">작성자</h4>
                    <p>{selectedAssignment.instructor?.name || "Unknown"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">마감일</h4>
                    <p>{selectedAssignment.due_date ? formatDate(selectedAssignment.due_date) : "없음"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">비밀번호 보호</h4>
                    <p>{selectedAssignment.password ? "예" : "아니오"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">최대 제출 수</h4>
                    <p>{selectedAssignment.max_submissions || "제한 없음"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">현재 제출 수</h4>
                    <p>{selectedAssignment.current_submissions || 0}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">조회수</h4>
                    <p>{selectedAssignment.views || 0}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">클래스 레벨</h4>
                    <p>{selectedAssignment.class_level || "없음"}</p>
                  </div>

                  <div className="col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">설명</h4>
                    <div className="mt-1 p-4 bg-gray-50 rounded-md">
                      {selectedAssignment.description ? (
                        <div dangerouslySetInnerHTML={{ __html: selectedAssignment.description }} />
                      ) : (
                        <p className="text-gray-400">설명 없음</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => handleEditClick(selectedAssignment.id)}>
                    <Edit className="h-4 w-4 mr-2" />
                    수정
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="submissions" className="pt-4">
                {loadingSubmissions ? (
                  <div className="flex justify-center my-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : submissionsError ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                    <p className="font-semibold">오류 발생</p>
                    <p className="text-sm mt-1">{submissionsError}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => loadSubmissions(selectedAssignment.id)}
                    >
                      다시 시도
                    </Button>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2">제출된 과제가 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission) => (
                      <Card key={submission.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between gap-4">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{submission.student_name}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {formatDate(submission.submitted_at || submission.created_at)}
                                </Badge>
                              </div>

                              {submission.comment && (
                                <div className="text-sm bg-gray-50 p-2 rounded-md">{submission.comment}</div>
                              )}

                              <div className="flex items-center gap-2 text-sm">
                                <Download className="h-4 w-4" />
                                <a
                                  href={submission.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {submission.file_name}
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:bg-red-50"
                                onClick={() => {
                                  setDeletingSubmissionId(submission.id)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 제출물 삭제 확인 대화상자 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>제출물 삭제 확인</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p>정말로 이 제출물을 삭제하시겠습니까?</p>
            <p className="text-sm text-gray-500 mt-2">이 작업은 되돌릴 수 없습니다.</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={deletingSubmission}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedAssignment && deletingSubmissionId) {
                  handleDeleteSubmission(deletingSubmissionId, selectedAssignment.id)
                }
              }}
              disabled={deletingSubmission}
            >
              {deletingSubmission ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  삭제 중...
                </>
              ) : (
                "삭제"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
