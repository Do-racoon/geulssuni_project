"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
  MessageSquare,
  Calendar,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface AssignmentPost {
  id: string
  title: string
  description: string
  author_id: string
  author_name: string
  created_at: string
  updated_at: string
  due_date: string
  class_level: string
  is_completed: boolean
  submissions_count: number
  total_students: number
  reviewer_notes: string[]
}

interface AssignmentBoardManagementProps {
  onAddPost: () => void
  onEditPost: (postId: string) => void
  currentUserId: string
  userRole: string
}

export default function AssignmentBoardManagement({
  onAddPost,
  onEditPost,
  currentUserId,
  userRole,
}: AssignmentBoardManagementProps) {
  const [assignments, setAssignments] = useState<AssignmentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof AssignmentPost>("due_date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterClassLevel, setFilterClassLevel] = useState<string>("all")
  const [filterCompletion, setFilterCompletion] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [reviewerNote, setReviewerNote] = useState("")
  const { toast } = useToast()

  const isAdmin = userRole === "admin"
  const isTeacher = userRole === "teacher"
  const canReview = isAdmin || isTeacher

  useEffect(() => {
    fetchAssignments()
  }, [])

  const fetchAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/board-posts?type=assignment")
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "과제를 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addReviewerNote = async (assignmentId: string) => {
    if (!reviewerNote.trim()) return

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          note: reviewerNote,
          reviewer_id: currentUserId,
        }),
      })

      if (response.ok) {
        const updatedAssignment = await response.json()
        setAssignments(
          assignments.map((assignment) => (assignment.id === assignmentId ? updatedAssignment : assignment)),
        )
        setReviewerNote("")
        setSelectedAssignment(null)
        toast({
          title: "성공",
          description: "검수자 메모가 추가되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "검수자 메모 추가에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAssignment = async (assignmentId: string, authorId: string) => {
    const canDelete = isAdmin || currentUserId === authorId
    if (!canDelete) {
      toast({
        title: "권한 없음",
        description: "이 과제를 삭제할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("정말로 이 과제를 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/board-posts/${assignmentId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId))
        toast({
          title: "성공",
          description: "과제가 삭제되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "과제 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const toggleCompletionStatus = async (assignmentId: string) => {
    if (!isAdmin) return

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/complete`, {
        method: "PATCH",
      })

      if (response.ok) {
        const updatedAssignment = await response.json()
        setAssignments(
          assignments.map((assignment) => (assignment.id === assignmentId ? updatedAssignment : assignment)),
        )
        toast({
          title: "성공",
          description: "과제 완료 상태가 변경되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "과제 상태 변경에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const canEditAssignment = (authorId: string) => {
    return isAdmin || currentUserId === authorId
  }

  const canDeleteAssignment = (authorId: string) => {
    return isAdmin || currentUserId === authorId
  }

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassLevel = filterClassLevel === "all" || assignment.class_level === filterClassLevel
      const matchesCompletion =
        filterCompletion === "all" ||
        (filterCompletion === "completed" ? assignment.is_completed : !assignment.is_completed)

      return matchesSearch && matchesClassLevel && matchesCompletion
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof AssignmentPost) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return <div className="text-center py-8">과제를 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="과제 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Filter className="h-4 w-4" />
            <span>필터</span>
          </button>

          <button
            onClick={onAddPost}
            className="flex items-center gap-1 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
          >
            <Plus className="h-4 w-4" />
            <span>새 과제</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm text-gray-600 mb-1">수준</label>
              <select
                value={filterClassLevel}
                onChange={(e) => setFilterClassLevel(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">모든 수준</option>
                <option value="beginner">초급</option>
                <option value="intermediate">중급</option>
                <option value="advanced">고급</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">상태</label>
              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">모든 상태</option>
                <option value="active">진행중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    제목
                    {sortField === "title" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("class_level")}
                >
                  <div className="flex items-center">
                    수준
                    {sortField === "class_level" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("author_name")}
                >
                  <div className="flex items-center">
                    강사
                    {sortField === "author_name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("due_date")}
                >
                  <div className="flex items-center">
                    마감일
                    {sortField === "due_date" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">제출현황</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">검수</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{assignment.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{assignment.class_level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{assignment.author_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(assignment.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {assignment.submissions_count}/{assignment.total_students}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCompletionStatus(assignment.id)}
                      disabled={!isAdmin}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        assignment.is_completed ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      } ${isAdmin ? "cursor-pointer hover:opacity-80" : "cursor-not-allowed"}`}
                    >
                      {assignment.is_completed ? "완료" : "진행중"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canReview && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            onClick={() => setSelectedAssignment(assignment.id)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span className="text-xs">{assignment.reviewer_notes?.length || 0}</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>검수자 메모</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">기존 메모</h4>
                              {assignment.reviewer_notes?.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                  {assignment.reviewer_notes.map((note, index) => (
                                    <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                                      {note}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500 text-sm">아직 메모가 없습니다.</p>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">새 메모 추가</h4>
                              <Textarea
                                value={reviewerNote}
                                onChange={(e) => setReviewerNote(e.target.value)}
                                placeholder="검수자 메모를 입력하세요..."
                                rows={3}
                              />
                              <Button
                                onClick={() => addReviewerNote(assignment.id)}
                                className="mt-2"
                                disabled={!reviewerNote.trim()}
                              >
                                메모 추가
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      {canEditAssignment(assignment.author_id) && (
                        <button onClick={() => onEditPost(assignment.id)} className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDeleteAssignment(assignment.author_id) && (
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id, assignment.author_id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">조건에 맞는 과제가 없습니다.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          총 {filteredAssignments.length}개의 과제
        </div>
      </div>
    </div>
  )
}
