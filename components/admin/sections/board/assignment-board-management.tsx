"use client"

import { useState, useEffect } from "react"
import { getBoardPosts, deleteBoardPost, updateAssignment, type BoardPost } from "@/lib/api/board-posts"
import { toast } from "@/hooks/use-toast"

const AssignmentBoardManagement = () => {
  const [assignments, setAssignments] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAssignments()
  }, [])

  const loadAssignments = async () => {
    try {
      setIsLoading(true)
      const data = await getBoardPosts("assignment")
      setAssignments(data)
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
        await deleteBoardPost(assignmentId)
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

  const handleReviewSubmission = async (assignmentId: string, memo: string) => {
    try {
      await updateAssignment(assignmentId, {
        is_completed: true,
        reviewer_memo: memo,
        completed_at: new Date().toISOString(),
        completed_by: "Admin",
      })
      await loadAssignments()
      toast({
        title: "Review completed",
        description: "The assignment review has been saved.",
      })
    } catch (error) {
      console.error("Error reviewing assignment:", error)
      toast({
        title: "Error",
        description: "Failed to save review",
        variant: "destructive",
      })
    }
  }

  return (
    <div>
      <h1>Assignment Board Management</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {assignments.map((assignment) => (
            <li key={assignment.id}>
              {assignment.title} - {assignment.content}
              <button onClick={() => handleDeleteAssignment(assignment.id)}>Delete</button>
              <button
                onClick={() => {
                  const memo = prompt("Enter review memo:")
                  if (memo) {
                    handleReviewSubmission(assignment.id, memo)
                  }
                }}
              >
                Review
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default AssignmentBoardManagement
