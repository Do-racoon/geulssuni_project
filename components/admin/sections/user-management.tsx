"use client"

import { useState, useEffect } from "react"
import { Search, Edit, Trash2, ChevronDown, ChevronUp, Filter } from "lucide-react"
import UserEditModal from "../modals/user-edit-modal"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  class_level: string | null
  role: "user" | "instructor" | "admin"
  created_at: string
  is_active: boolean
  email_verified: boolean
  nickname?: string
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof User>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterRole, setFilterRole] = useState<"all" | "user" | "instructor" | "admin">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  // 사용자 데이터 로드
  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("사용자 로드 오류:", error)
        toast.error("사용자 데이터를 불러오는데 실패했습니다.")
        return
      }

      setUsers(data || [])
    } catch (error) {
      console.error("사용자 로드 오류:", error)
      toast.error("사용자 데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // 필터링 및 정렬된 사용자 목록
  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.nickname?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = filterRole === "all" || user.role === filterRole
      const matchesStatus = filterStatus === "all" || (filterStatus === "active" ? user.is_active : !user.is_active)

      return matchesSearch && matchesRole && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("정말로 이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return
    }

    try {
      setDeleteLoading(userId)

      // 1. 먼저 이 사용자가 작성한 게시물의 author_id를 NULL로 설정
      const { error: postsError } = await supabase
        .from("board_posts")
        .update({ author_id: null })
        .eq("author_id", userId)

      if (postsError) {
        console.error("게시물 업데이트 오류:", postsError)
        toast.error("사용자 삭제 전 게시물 처리에 실패했습니다.")
        return
      }

      // 2. 이 사용자가 작성한 댓글의 author_id를 NULL로 설정
      const { error: commentsError } = await supabase
        .from("comments")
        .update({ author_id: null })
        .eq("author_id", userId)

      if (commentsError) {
        console.error("댓글 업데이트 오류:", commentsError)
        toast.error("사용자 삭제 전 댓글 처리에 실패했습니다.")
        return
      }

      // 3. 이 사용자가 작성한 과제 제출물의 student_id를 NULL로 설정
      const { error: submissionsError } = await supabase
        .from("assignment_submissions")
        .update({ student_id: null })
        .eq("student_id", userId)

      if (submissionsError) {
        console.error("과제 제출물 업데이트 오류:", submissionsError)
        toast.error("사용자 삭제 전 과제 제출물 처리에 실패했습니다.")
        return
      }

      // 4. 이제 사용자 삭제
      const { error: deleteError } = await supabase.from("users").delete().eq("id", userId)

      if (deleteError) {
        console.error("사용자 삭제 오류:", deleteError)
        toast.error(`사용자 삭제에 실패했습니다: ${deleteError.message}`)
        return
      }

      toast.success("사용자가 삭제되었습니다.")
      loadUsers()
    } catch (error: any) {
      console.error("사용자 삭제 오류:", error)
      toast.error(`사용자 삭제에 실패했습니다: ${error.message || "알 수 없는 오류"}`)
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleUserUpdate = async (updatedUser: User) => {
    try {
      const validRoles = ["user", "admin", "instructor"]
      if (!validRoles.includes(updatedUser.role)) {
        toast.error("올바르지 않은 역할입니다.")
        return
      }

      const { error } = await supabase
        .from("users")
        .update({
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          class_level: updatedUser.class_level,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
          nickname: updatedUser.nickname,
        })
        .eq("id", updatedUser.id)

      if (error) {
        console.error("사용자 업데이트 오류:", error)
        toast.error("사용자 정보 업데이트에 실패했습니다.")
        return
      }

      toast.success("사용자 정보가 업데이트되었습니다.")
      setIsEditModalOpen(false)
      loadUsers()
    } catch (error) {
      console.error("사용자 업데이트 오류:", error)
      toast.error("사용자 정보 업데이트에 실패했습니다.")
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "instructor":
        return "bg-blue-100 text-blue-800"
      case "user":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자"
      case "instructor":
        return "강사"
      case "user":
        return "학생"
      default:
        return role
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        <span className="ml-2">사용자 데이터를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">사용자 관리</h1>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="사용자 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              필터
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">역할</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="all">모든 역할</option>
                  <option value="user">학생</option>
                  <option value="instructor">강사</option>
                  <option value="admin">관리자</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">상태</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="all">모든 상태</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    이름
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  연락처
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("class_level")}
                >
                  <div className="flex items-center">
                    클래스
                    {sortField === "class_level" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("role")}
                >
                  <div className="flex items-center">
                    역할
                    {sortField === "role" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    가입일
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("is_active")}
                >
                  <div className="flex items-center">
                    상태
                    {sortField === "is_active" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name || "이름 없음"}</div>
                    {user.nickname && <div className="text-sm text-gray-500">@{user.nickname}</div>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone || "전화번호 없음"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {user.class_level || (user.role !== "user" ? "해당없음" : "미지정")}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString("ko-KR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.is_active ? "활성" : "비활성"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="편집"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-900"
                      title="삭제"
                      disabled={deleteLoading === user.id}
                    >
                      {deleteLoading === user.id ? (
                        <div className="h-4 w-4 border-2 border-t-transparent border-red-600 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || filterRole !== "all" || filterStatus !== "all"
                ? "검색 조건에 맞는 사용자가 없습니다."
                : "등록된 사용자가 없습니다."}
            </p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          총 {users.length}명 중 {filteredUsers.length}명 표시
        </div>
      </div>

      {isEditModalOpen && selectedUser && (
        <UserEditModal user={selectedUser} onClose={() => setIsEditModalOpen(false)} onSave={handleUserUpdate} />
      )}
    </div>
  )
}
