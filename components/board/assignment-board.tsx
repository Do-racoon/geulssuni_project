"use client"

import { useState } from "react"
import { assignmentPosts } from "@/data/board-posts"
import AssignmentCard from "./assignment-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Search } from "lucide-react"
import Link from "next/link"

export default function AssignmentBoard() {
  const [posts, setPosts] = useState(assignmentPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [completionFilter, setCompletionFilter] = useState("all") // "all", "completed", "incomplete"

  // Mock user role - in a real app, this would come from authentication
  const isInstructor = true

  const handleComplete = (postId: string) => {
    // In a real app, this would update the database
    setPosts(posts.map((post) => (post.id === postId ? { ...post, isCompleted: !post.isCompleted } : post)))
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesLevel = selectedLevel === "" || post.classLevel === selectedLevel

    const matchesCompletion =
      completionFilter === "all" ||
      (completionFilter === "completed" && post.isCompleted) ||
      (completionFilter === "incomplete" && !post.isCompleted)

    return matchesSearch && matchesLevel && matchesCompletion
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-light tracking-wider">Assignments</h2>
        <Link href="/board/assignment/create">
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Assignment
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedLevel} onValueChange={setSelectedLevel}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
        <Select value={completionFilter} onValueChange={setCompletionFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Completion status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="incomplete">Not Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          {filteredPosts.length} {filteredPosts.length === 1 ? "assignment" : "assignments"} found
        </div>
        <div className="flex gap-2 items-center">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block bg-black rounded-full"></span> Completed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 inline-block border border-gray-300 rounded-full"></span> Not Completed
          </span>
        </div>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">No assignments found.</p>
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
