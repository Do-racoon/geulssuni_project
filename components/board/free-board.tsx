"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import PostCard from "@/components/board/post-card"
import { Search, Plus } from "lucide-react"
import { getFreeBoardPosts } from "@/lib/api/board"
import type { BoardPost } from "@/lib/api/board"

export default function FreeBoard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 올바른 카테고리 정의: 자유, 질문, 공유
  const categories = [
    { value: "all", label: "ALL" },
    { value: "general", label: "FREE" },
    { value: "open", label: "QUESTION" },
    { value: "sharing", label: "SHARE" },
  ]

  // 실제 데이터베이스에서 게시글 가져오기
  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        const data = await getFreeBoardPosts(selectedCategory === "all" ? "all" : selectedCategory)
        setPosts(data)
      } catch (error) {
        console.error("게시글 로딩 오류:", error)
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [selectedCategory])

  // 검색 필터링
  useEffect(() => {
    let filtered = [...posts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          post.author?.name.toLowerCase().includes(query),
      )
    }

    setFilteredPosts(filtered)
  }, [searchQuery, posts])

  // 좋아요 처리 함수
  const handleLike = async (postId: string) => {
    // 실제 좋아요 API 호출 구현 필요
    console.log(`좋아요: ${postId}`)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="w-full sm:w-[180px] h-10 bg-gray-200 animate-pulse"></div>
            <div className="w-full sm:w-[300px] h-10 bg-gray-200 animate-pulse"></div>
          </div>
          <div className="w-full sm:w-auto h-10 bg-gray-200 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[240px] h-11 bg-white border border-black hover:bg-gray-50 focus:border-black transition-colors">
              <SelectValue placeholder="CATEGORY" />
            </SelectTrigger>
            <SelectContent className="border border-black">
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value} className="py-3 tracking-wider font-light">
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-black" />
            <Input
              type="search"
              placeholder="SEARCH"
              className="pl-10 h-11 bg-white border border-black hover:bg-gray-50 focus:border-black transition-colors tracking-wider font-light"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={() => router.push("/board/create")}
          className="w-full sm:w-auto h-11 px-6 bg-black hover:bg-gray-800 text-white tracking-wider font-light"
        >
          <Plus className="mr-2 h-4 w-4" />
          WRITE
        </Button>
      </div>

      {filteredPosts.length > 0 ? (
        <div className="grid gap-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))}
        </div>
      ) : (
        <Card className="border border-black">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-center text-gray-500 mb-4 tracking-wider font-light">
              {searchQuery ? "NO RESULTS FOUND" : "NO POSTS YET"}
            </p>
            <div className="flex gap-2">
              {searchQuery && (
                <Button
                  onClick={() => setSearchQuery("")}
                  variant="outline"
                  className="border border-black hover:bg-gray-50 tracking-wider font-light"
                >
                  RESET SEARCH
                </Button>
              )}
              <Button
                onClick={() => router.push("/board/create")}
                className="bg-black hover:bg-gray-800 text-white tracking-wider font-light"
              >
                WRITE FIRST POST
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
