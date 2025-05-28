"use client"

import { useState, useEffect } from "react"
import AssignmentCard from "./assignment-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"

interface Assignment {
  id: string
  title: string
  content: string
  category: string
  type: string
  author_id: string
  author?: {
    name: string
    avatar?: string
  }
  is_pinned: boolean
  likes: number
  comments_count: number
  views: number
  created_at: string
  assignments?: {
    class_level: string
    is_completed: boolean
    submissions_count: number
    total_students: number
  }
  password?: string
}

export default function AssignmentBoard() {
  const [posts, setPosts] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("all")
  const [completionFilter, setCompletionFilter] = useState("all")

  // Mock user role - in a real app, this would come from authentication
  const isInstructor = true

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/assignments")
      if (response.ok) {
        const data = await response.json()
        setPosts(data)
      } else {
        console.error("Failed to load assignments")
      }
    } catch (error) {
      console.error("Error loading assignments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = (postId: string) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              assignments: post.assignments
                ? { ...post.assignments, is_completed: !post.assignments.is_completed }
                : { class_level: "", is_completed: true, submissions_count: 0, total_students: 0 },
            }
          : post,
      ),
    )
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLevel = selectedLevel === "all" || (post.assignments && post.assignments.class_level === selectedLevel)

    const matchesCompletion =
      completionFilter === "all" ||
      (completionFilter === "completed" && post.assignments?.is_completed) ||
      (completionFilter === "incomplete" && !post.assignments?.is_completed)

    return matchesSearch && matchesLevel && matchesCompletion
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-light tracking-wider">과제</h2>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-500">과제를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-light tracking-wider">과제</h2>
        <Link href="/board/assignment/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />새 과제
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="과제 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="난이도 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 난이도</SelectItem>
            <SelectItem value="beginner">기초반</SelectItem>
            <SelectItem value="intermediate">중급반</SelectItem>
            <SelectItem value="advanced">전문반</SelectItem>
          </SelectContent>
        </Select>
        <Select value={completionFilter} onValueChange={setCompletionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="완료 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">모든 과제</SelectItem>
            <SelectItem value="completed">완료됨</SelectItem>
            <SelectItem value="incomplete">미완료</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>{filteredPosts.length}개의 과제 발견</div>
        <div className="flex gap-2 items-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block bg-black rounded-full"></span> 완료됨
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block border border-gray-300 rounded-full"></span> 미완료
          </span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">과제가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredPosts.map((post) => (
            <AssignmentCard key={post.id} assignment={post} onComplete={handleComplete} isInstructor={isInstructor} />
          ))}
        </div>
      )}
    </div>
  )
}
