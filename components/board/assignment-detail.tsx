"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Edit, Lock, Users, Calendar, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"
import AssignmentSubmissionsDisplay from "./assignment-submissions-display"

interface Assignment {
  id: string
  title: string
  content: string
  description: string
  class_level: string
  due_date: string | null
  max_submissions: number | null
  current_submissions: number
  password: string | null
  author_id: string
  instructor_id: string
  created_at: string
  updated_at: string
  author?: { id: string; name: string; email: string }
  instructor?: { id: string; name: string; email: string }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AssignmentDetailProps {
  assignmentId: string
}

export default function AssignmentDetail({ assignmentId }: AssignmentDetailProps) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAssignmentAndUser()
  }, [assignmentId])

  const loadAssignmentAndUser = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("id, name, email, role")
          .eq("id", user.id)
          .single()
        setCurrentUser(userData)
      }

      // 과제 정보 가져오기
      const { data: assignmentData, error } = await supabase
        .from("assignments")
        .select(`
          *,
          author:users!author_id(id, name, email),
          instructor:users!instructor_id(id, name, email)
        `)
        .eq("id", assignmentId)
        .single()

      if (error) {
        console.error("Error loading assignment:", error)
        throw error
      }

      setAssignment(assignmentData)
    } catch (error) {
      console.error("Error loading assignment:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment details",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    router.push(`/board/assignment/${assignmentId}/edit`)
  }

  const canEdit =
    currentUser &&
    (currentUser.role === "admin" || (currentUser.role === "instructor" && assignment?.author_id === currentUser.id))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-light mb-4">Assignment not found</h1>
        <p className="text-gray-600">The requested assignment does not exist or has been deleted.</p>
      </div>
    )
  }

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; color: string }> = {
      beginner: { label: "기초반", color: "bg-green-100 text-green-800" },
      intermediate: { label: "중급반", color: "bg-yellow-100 text-yellow-800" },
      advanced: { label: "전문반", color: "bg-red-100 text-red-800" },
    }
    const levelInfo = levelMap[level] || { label: level, color: "bg-gray-100 text-gray-800" }
    return <Badge className={`${levelInfo.color} border-0`}>{levelInfo.label}</Badge>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-light tracking-wider">{assignment.title}</CardTitle>

              <div className="flex items-center gap-2">
                {getLevelBadge(assignment.class_level)}

                {assignment.password && (
                  <Badge className="bg-blue-100 text-blue-800 border-0 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Protected
                  </Badge>
                )}
              </div>
            </div>

            {canEdit && (
              <div className="flex gap-2">
                <Button onClick={handleEdit} variant="outline" size="sm" className="flex items-center gap-1">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <>
            <p className="text-gray-700 whitespace-pre-wrap">{assignment.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {assignment.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Due: {new Date(assignment.due_date).toLocaleDateString()}
                </div>
              )}

              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                Submissions: {assignment.current_submissions}/{assignment.max_submissions || "∞"}
              </div>

              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Author: {assignment.author?.name}
              </div>
            </div>
          </>
        </CardContent>
      </Card>

      {/* 제출물 표시 */}
      <AssignmentSubmissionsDisplay assignmentId={assignmentId} />
    </div>
  )
}
