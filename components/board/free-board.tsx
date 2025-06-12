"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import PostCard from "@/components/board/post-card"
import { Search, Plus, RefreshCw } from "lucide-react"
import { getFreeBoardPosts } from "@/lib/api/board"
import type { BoardPost } from "@/lib/api/board"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function FreeBoard() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)

  const categories = [
    { value: "all", label: "ALL" },
    { value: "general", label: "FREE" },
    { value: "open", label: "QUESTION" },
    { value: "sharing", label: "SHARE" },
  ]

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true)
        const supabase = createClientComponentClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session || !session.user) {
          setUser(null)
          return
        }

        const { data: userProfiles } = await supabase
          .from("users")
          .select("id, name, email, role, class_level, is_active")
          .eq("id", session.user.id)

        if (!userProfiles || userProfiles.length === 0) {
          const { data: userByEmail } = await supabase
            .from("users")
            .select("id, name, email, role, class_level, is_active")
            .eq("email", session.user.email)

          if (!userByEmail || userByEmail.length === 0) {
            setUser(null)
            return
          }

          const userProfile = userByEmail[0]
          if (!userProfile.is_active) {
            setUser(null)
            return
          }

          setUser({
            id: userProfile.id,
            name: userProfile.name,
            email: userProfile.email,
            role: userProfile.role,
            class_level: userProfile.class_level,
          })
          return
        }

        const userProfile = userProfiles[0]
        if (!userProfile.is_active) {
          setUser(null)
          return
        }

        setUser({
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          role: userProfile.role,
          class_level: userProfile.class_level,
        })
      } catch (error) {
        setUser(null)
      } finally {
        setUserLoading(false)
      }
    }

    fetchUser()
  }, [])

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setIsLoading(true)
        const data = await getFreeBoardPosts(selectedCategory === "all" ? "all" : selectedCategory)
        setPosts(data)
      } catch (error) {
        setPosts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [selectedCategory])

  useEffect(() => {
    let filtered = [...posts]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query) ||
          (post.author?.name && post.author.name.toLowerCase().includes(query)),
      )
    }

    setFilteredPosts(filtered)
  }, [searchQuery, posts])

  const handleLike = async (postId: string) => {
    if (!user) {
      alert("좋아요를 누르려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }
  }

  const handleWriteClick = async () => {
    if (userLoading) {
      return
    }

    if (!user) {
      alert("글을 작성하려면 로그인이 필요합니다.")
      router.push("/login")
      return
    }

    router.push("/board/create")
  }

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const data = await getFreeBoardPosts(selectedCategory === "all" ? "all" : selectedCategory)
      setPosts(data)
    } catch (error) {
      setPosts([])
    } finally {
      setIsLoading(false)
    }
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
    <div className="space-y-8 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-light tracking-[0.2em] uppercase text-black">FREE BOARD</h2>
          <p className="text-sm text-gray-500 mt-2 font-light tracking-wider">자유롭게 의견을 나누는 공간입니다</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button
            onClick={loadPosts}
            variant="outline"
            size="sm"
            className="border-black text-black hover:bg-black hover:text-white transition-all duration-300 font-light tracking-wider uppercase w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            REFRESH
          </Button>

          <Button
            onClick={handleWriteClick}
            disabled={userLoading}
            className="w-full sm:w-auto h-11 px-6 bg-black hover:bg-gray-800 text-white tracking-wider font-light disabled:opacity-50"
          >
            <Plus className="mr-2 h-4 w-4" />
            {userLoading ? "LOADING..." : "NEW POST"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="SEARCH POSTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 border-gray-300 focus:border-black transition-colors duration-300 font-light tracking-wider"
          />
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="border-gray-300 focus:border-black font-light tracking-wider">
            <SelectValue placeholder="CATEGORY FILTER" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="py-3 tracking-wider font-light">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
                onClick={handleWriteClick}
                disabled={userLoading}
                className="bg-black hover:bg-gray-800 text-white tracking-wider font-light disabled:opacity-50"
              >
                {userLoading ? "LOADING..." : "NEW POST"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-gray-500 font-light tracking-wider pt-6 border-t border-gray-200 gap-4">
        <div>
          {filteredPosts.length} OF {posts.length} POSTS
        </div>
      </div>
    </div>
  )
}
