"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Search, Filter, ChevronDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import PostCard from "@/components/board/post-card"
import { createSupabaseClient } from "@/lib/supabase/client"

interface Post {
  id: string
  title: string
  content: string
  category: string
  type: string
  created_at: string
  views: number
  likes: number
  comments_count: number
  author: {
    id: string
    name: string
  }
  author_id: string
}

export default function FreeBoardManagement() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [hasLoadedPosts, setHasLoadedPosts] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const postsPerPage = 10

  console.log(`[FreeBoardManagement] Component mounted`)

  // 게시글 로드 함수를 useCallback으로 메모이제이션
  const loadPosts = useCallback(
    async (page = 1) => {
      if (hasLoadedPosts && page === 1) {
        console.log(`[FreeBoardManagement] Posts already loaded`)
        return
      }

      setIsLoading(true)
      console.log(`[FreeBoardManagement] Loading posts for page: ${page}`)

      try {
        const supabase = createSupabaseClient()
        const offset = (page - 1) * postsPerPage

        // 전체 게시글 수 조회
        const { count } = await supabase
          .from("board_posts")
          .select("*", { count: "exact", head: true })
          .eq("type", "free")

        const totalCount = count || 0
        const calculatedTotalPages = Math.ceil(totalCount / postsPerPage)

        // 게시글 조회
        const { data: postsData, error } = await supabase
          .from("board_posts")
          .select(`
          id,
          title,
          content,
          category,
          type,
          created_at,
          views,
          likes,
          comments_count,
          author_id,
          author:users!author_id(id, name)
        `)
          .eq("type", "free")
          .order("created_at", { ascending: false })
          .range(offset, offset + postsPerPage - 1)

        if (error) {
          console.error(`[FreeBoardManagement] Error loading posts:`, error)
          return
        }

        console.log(`[FreeBoardManagement] Loaded ${postsData?.length || 0} posts`)
        setPosts(postsData || [])
        setTotalPages(calculatedTotalPages)
        setCurrentPage(page)

        if (page === 1) {
          setHasLoadedPosts(true)
        }
      } catch (error) {
        console.error(`[FreeBoardManagement] Unexpected error loading posts:`, error)
      } finally {
        setIsLoading(false)
      }
    },
    [hasLoadedPosts, postsPerPage],
  )

  // 검색 및 필터링 함수를 useCallback으로 메모이제이션
  const filterPosts = useCallback(() => {
    console.log(
      `[FreeBoardManagement] Filtering posts with search: "${searchTerm}", category: ${selectedCategory}, type: ${selectedType}`,
    )

    let filtered = posts

    // 검색어 필터링
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.author.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // 카테고리 필터링
    if (selectedCategory !== "all") {
      filtered = filtered.filter((post) => post.category === selectedCategory)
    }

    // 타입 필터링
    if (selectedType !== "all") {
      filtered = filtered.filter((post) => post.type === selectedType)
    }

    console.log(`[FreeBoardManagement] Filtered ${filtered.length} posts from ${posts.length} total`)
    setFilteredPosts(filtered)
  }, [posts, searchTerm, selectedCategory, selectedType])

  // 페이지 변경 핸들러
  const handlePageChange = useCallback(
    (page: number) => {
      console.log(`[FreeBoardManagement] Changing to page: ${page}`)
      loadPosts(page)
    },
    [loadPosts],
  )

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((value: string) => {
    console.log(`[FreeBoardManagement] Search term changed: "${value}"`)
    setSearchTerm(value)
  }, [])

  // 카테고리 변경 핸들러
  const handleCategoryChange = useCallback((category: string) => {
    console.log(`[FreeBoardManagement] Category changed: ${category}`)
    setSelectedCategory(category)
  }, [])

  // 타입 변경 핸들러
  const handleTypeChange = useCallback((type: string) => {
    console.log(`[FreeBoardManagement] Type changed: ${type}`)
    setSelectedType(type)
  }, [])

  // 컴포넌트 마운트 시 게시글 로드 (한 번만)
  useEffect(() => {
    console.log(`[FreeBoardManagement] useEffect for loadPosts triggered, hasLoaded: ${hasLoadedPosts}`)
    loadPosts(1)
  }, [loadPosts])

  // 필터링 조건 변경 시 필터링 실행
  useEffect(() => {
    console.log(`[FreeBoardManagement] useEffect for filterPosts triggered`)
    filterPosts()
  }, [filterPosts])

  // 메모이제이션된 카테고리 옵션
  const categoryOptions = useMemo(
    () => [
      { value: "all", label: "ALL CATEGORIES" },
      { value: "general", label: "GENERAL" },
      { value: "sharing", label: "SHARING" },
      { value: "question", label: "QUESTION" },
      { value: "tech", label: "TECH" },
      { value: "design", label: "DESIGN" },
    ],
    [],
  )

  // 메모이제이션된 타입 옵션
  const typeOptions = useMemo(
    () => [
      { value: "all", label: "ALL TYPES" },
      { value: "free", label: "FREE" },
      { value: "notice", label: "NOTICE" },
      { value: "qna", label: "Q&A" },
    ],
    [],
  )

  // 메모이제이션된 게시글 목록
  const postList = useMemo(() => {
    const postsToShow = searchTerm || selectedCategory !== "all" || selectedType !== "all" ? filteredPosts : posts

    if (postsToShow.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 tracking-wider font-light">
            {isLoading ? "Loading posts..." : "No posts found."}
          </p>
        </div>
      )
    }

    return (
      <div className="grid gap-6">
        {postsToShow.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    )
  }, [posts, filteredPosts, searchTerm, selectedCategory, selectedType, isLoading])

  return (
    <div className="space-y-6">
      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-black focus:border-black tracking-wider font-light rounded-none"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
              >
                <Filter className="h-4 w-4 mr-2" />
                {categoryOptions.find((opt) => opt.value === selectedCategory)?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-black rounded-none">
              {categoryOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleCategoryChange(option.value)}
                  className="tracking-wider font-light"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
              >
                {typeOptions.find((opt) => opt.value === selectedType)?.label}
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-black rounded-none">
              {typeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleTypeChange(option.value)}
                  className="tracking-wider font-light"
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 게시글 목록 */}
      {postList}

      {/* 페이지네이션 */}
      {totalPages > 1 && !searchTerm && selectedCategory === "all" && selectedType === "all" && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isLoading}
            className="border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
          >
            PREV
          </Button>
          <span className="px-4 py-2 tracking-wider font-light">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isLoading}
            className="border-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
          >
            NEXT
          </Button>
        </div>
      )}
    </div>
  )
}
