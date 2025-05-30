"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

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
  has_password: boolean
  author_id: string
  instructor_id: string
  created_at: string
  updated_at: string
  author?: { id: string; name: string; email: string }
  instructor?: { id: string; name: string; email: string }
}

const AssignmentBoardManagement = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from("assignments")
        .select(`
        *,
        author:users!author_id(id, name, email),
        instructor:users!instructor_id(id, name, email)
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error loading assignments:", error)
        throw error
      }

      setAssignments(data || [])
    } catch (error) {
      console.error("Error loading assignments:", error)
      toast({
        title: "Error",
        description: "Failed to load assignments",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (confirm("Are you sure you want to delete this assignment?")) {
      try {
        setIsLoading(true)
        const supabase = createClient()

        const { error } = await supabase.from("assignments").delete().eq("id", assignmentId)

        if (error) {
          console.error("Error deleting assignment:", error)
          throw error
        }

        await loadAssignments()
        toast({
          title: "Assignment deleted",
          description: "The assignment has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting assignment:", error)
        toast({
          title: "Error",
          description: "Failed to delete assignment",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleChangePassword = async (assignmentId: string) => {
    const newPassword = prompt("Enter new password (leave empty to remove password):")

    if (newPassword === null) return // 취소한 경우

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("assignments")
        .update({
          password: newPassword || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignmentId)

      if (error) {
        console.error("Error changing password:", error)
        throw error
      }

      await loadAssignments()
      toast({
        title: "Password updated",
        description: newPassword ? "Password has been set successfully." : "Password has been removed.",
      })
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to update password",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignment Management</h1>
        <button onClick={loadAssignments} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No assignments found</p>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-lg">{assignment.title}</h3>
                    <p className="text-sm text-gray-600">
                      Class: {assignment.class_level} | Due:{" "}
                      {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : "No due date"} |
                      Submissions: {assignment.current_submissions}/{assignment.max_submissions || "∞"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Author: {assignment.author?.name} | Password: {assignment.password ? "Yes" : "No"}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleChangePassword(assignment.id)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      {assignment.password ? "Change Password" : "Set Password"}
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{assignment.description}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default AssignmentBoardManagement
