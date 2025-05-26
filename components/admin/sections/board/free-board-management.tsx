"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, Pin, PinOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FreeBoardPost {
  id: string
  title: string
  content: string
  author_id: string
  author_name: string
  created_at: string
  updated_at: string
  is_published: boolean
  is_pinned: boolean
  category: string
  comments_count: number
  likes_count: number
}

interface FreeBoardManagementProps {
  onAddPost: () => void
  onEditPost: (postId: string) => void
  currentUserId: string
  userRole: string
}

export default function FreeBoardManagement({
  onAddPost,
  onEditPost,
  currentUserId,
  userRole,
}: FreeBoardManagementProps) {
  const [posts, setPosts] = useState<FreeBoardPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof FreeBoardPost>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const { toast } = useToast()

  const isAdmin = userRole === "admin"

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/board-posts?type=free")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "게시글을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePin = async (postId: string, currentPinned: boolean) => {
    if (!isAdmin) return

    try {
      const response = await fetch(`/api/board-posts/${postId}/pin`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_pinned: !currentPinned }),
      })

      if (response.ok) {
        setPosts(posts.map((post) => (post.id === postId ? { ...post, is_pinned: !currentPinned } : post)))
        toast({
          title: "성공",
          description: `게시글이 ${!currentPinned ? "고정" : "고정 해제"}되었습니다.`,
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "게시글 고정 상태 변경에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const handleDeletePost = async (postId: string, authorId: string) => {
    const canDelete = isAdmin || currentUserId === authorId
    if (!canDelete) {
      toast({
        title: "권한 없음",
        description: "이 게시글을 삭제할 권한이 없습니다.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return

    try {
      const response = await fetch(`/api/board-posts/${postId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== postId))
        toast({
          title: "성공",
          description: "게시글이 삭제되었습니다.",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const canEditPost = (authorId: string) => {
    return isAdmin || currentUserId === authorId
  }

  const canDeletePost = (authorId: string) => {
    return isAdmin || currentUserId === authorId
  }

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || post.category === filterCategory
      const matchesStatus =
        filterStatus === "all" || (filterStatus === "published" ? post.is_published : !post.is_published)

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      // 고정된 게시글을 항상 위에 표시
      if (a.is_pinned && !b.is_pinned) return -1
      if (!a.is_pinned && b.is_pinned) return 1

      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof FreeBoardPost) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  if (loading) {
    return <div className="text-center py-8">게시글을 불러오는 중...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="게시글 검색..."
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
            <span>새 게시글</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm text-gray-600 mb-1">카테고리</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">모든 카테고리</option>
                <option value="design">디자인</option>
                <option value="photography">사진</option>
                <option value="writing">글쓰기</option>
                <option value="discussion">토론</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">모든 상태</option>
                <option value="published">게시됨</option>
                <option value="draft">임시저장</option>
              </select>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">고정</th>
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
                  onClick={() => handleSort("author_name")}
                >
                  <div className="flex items-center">
                    작성자
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
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    작성일
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">통계</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isAdmin && (
                      <button
                        onClick={() => togglePin(post.id, post.is_pinned)}
                        className={`p-1 rounded ${
                          post.is_pinned ? "text-yellow-600 hover:text-yellow-800" : "text-gray-400 hover:text-gray-600"
                        }`}
                        title={post.is_pinned ? "고정 해제" : "상단 고정"}
                      >
                        {post.is_pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium flex items-center">
                      {post.is_pinned && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">고정</span>
                      )}
                      {post.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{post.author_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <span className="mr-3">💬 {post.comments_count}</span>
                      <span>❤️ {post.likes_count}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        post.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.is_published ? "게시됨" : "임시저장"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      {canEditPost(post.author_id) && (
                        <button onClick={() => onEditPost(post.id)} className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {canDeletePost(post.author_id) && (
                        <button
                          onClick={() => handleDeletePost(post.id, post.author_id)}
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

        {filteredPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">조건에 맞는 게시글이 없습니다.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          총 {filteredPosts.length}개의 게시글
        </div>
      </div>
    </div>
  )
}
