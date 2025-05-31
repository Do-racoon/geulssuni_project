"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react"
import Image from "next/image"
import AddAuthorModal from "../modals/add-author-modal"
import { getAuthors, deleteAuthor, type Author } from "@/lib/api/authors"
import { toast } from "@/hooks/use-toast"

export default function AuthorsManagement() {
  const [authorsList, setAuthorsList] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Author>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterFeatured, setFilterFeatured] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)

  useEffect(() => {
    loadAuthors()
  }, [])

  // 저자 업데이트 이벤트 리스너
  useEffect(() => {
    const handleAuthorUpdate = () => {
      loadAuthors()
    }

    window.addEventListener("author-updated", handleAuthorUpdate)
    return () => {
      window.removeEventListener("author-updated", handleAuthorUpdate)
    }
  }, [])

  const loadAuthors = async () => {
    try {
      setIsLoading(true)
      const data = await getAuthors()
      setAuthorsList(data)
    } catch (error) {
      console.error("Error loading authors:", error)
      toast({
        title: "오류",
        description: "저자 목록을 불러오는데 실패했습니다",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort authors
  const filteredAuthors = authorsList
    .filter((author) => {
      const matchesSearch =
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (author.profession && author.profession.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === "all" || author.status === filterStatus
      const matchesFeatured =
        filterFeatured === "all" || (filterFeatured === "featured" ? author.featured : !author.featured)

      return matchesSearch && matchesStatus && matchesFeatured
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Author) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteAuthor = async (authorId: string) => {
    if (confirm("정말로 이 저자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      try {
        setIsLoading(true)
        await deleteAuthor(authorId)
        await loadAuthors()
        toast({
          title: "저자 삭제 완료",
          description: "저자가 성공적으로 삭제되었습니다.",
        })
      } catch (error) {
        console.error("Error deleting author:", error)
        toast({
          title: "오류",
          description: "저자 삭제에 실패했습니다",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  // 새 저자 추가 버튼 클릭 핸들러
  const handleAddAuthorClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("새 저자 추가 버튼 클릭됨")
    setShowAddModal(true)
  }

  // 저자 편집 버튼 클릭 핸들러
  const handleEditAuthorClick = (e: React.MouseEvent, author: Author) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("저자 편집 버튼 클릭됨:", author.name)
    setEditingAuthor(author)
  }

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingAuthor(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-light">저자 관리</h2>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">저자 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-light">저자 관리</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="저자 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <Filter className="h-4 w-4" />
              <span>필터</span>
            </button>

            <button
              type="button"
              onClick={handleAddAuthorClick}
              className="flex items-center gap-1 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
            >
              <Plus className="h-4 w-4" />
              <span>새 저자</span>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">모든 상태</option>
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
                <option value="pending">대기</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">추천</label>
              <select
                value={filterFeatured}
                onChange={(e) => setFilterFeatured(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">모든 저자</option>
                <option value="featured">추천 저자</option>
                <option value="not-featured">일반 저자</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
              <select
                value={`${sortField}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-")
                  setSortField(field as keyof Author)
                  setSortDirection(direction as "asc" | "desc")
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="name-asc">이름 (가나다순)</option>
                <option value="name-desc">이름 (역순)</option>
                <option value="created_at-desc">최신순</option>
                <option value="created_at-asc">오래된순</option>
                <option value="likes-desc">좋아요 많은순</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <div key={author.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 flex items-center">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                <Image
                  src={author.image_url || "/placeholder.svg?height=80&width=80"}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium">{author.name}</h3>
                {author.profession && <p className="text-sm text-gray-500 mt-1">{author.profession}</p>}
                {author.experience && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{author.experience}</p>}
                <div className="flex items-center mt-2">
                  <span className="text-xs text-gray-500">작품 {author.number_of_works}개</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <span className="text-xs text-gray-500">좋아요 {author.likes}</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  author.status === "active"
                    ? "bg-green-100 text-green-800"
                    : author.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {author.status === "active" ? "활성" : author.status === "inactive" ? "비활성" : "대기"}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={(e) => handleEditAuthorClick(e, author)}
                  className="text-gray-600 hover:text-gray-900 p-1"
                  title="저자 편집"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    handleDeleteAuthor(author.id)
                  }}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="저자 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAuthors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">검색 조건에 맞는 저자가 없습니다.</p>
        </div>
      )}

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        총 {filteredAuthors.length}명의 저자 중 {authorsList.length}명 표시
      </div>

      {/* 새 저자 추가 모달 */}
      {showAddModal && <AddAuthorModal onClose={handleCloseModal} />}

      {/* 저자 편집 모달 (아직 구현되지 않음) */}
      {editingAuthor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">저자 편집</h3>
            <p className="text-gray-600 mb-4">저자 편집 기능은 아직 구현되지 않았습니다.</p>
            <p className="text-sm text-gray-500 mb-4">편집할 저자: {editingAuthor.name}</p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
