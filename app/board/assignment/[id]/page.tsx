"use client"

import Link from "next/link"
import { ArrowLeft, Calendar, User, CheckSquare, Edit, Trash2, Download, Square } from "lucide-react"
import { getAssignmentPost } from "@/data/board-posts"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function AssignmentDetailPage({ params }: { params: { id: string } }) {
  const [assignment, setAssignment] = useState(getAssignmentPost(params.id))
  const [isCompleted, setIsCompleted] = useState(assignment?.isCompleted || false)

  if (!assignment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Assignment not found</h1>
          <Link href="/board" className="text-sm underline">
            Return to board
          </Link>
        </div>
      </div>
    )
  }

  const formattedDate = new Date(assignment.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  const formattedReviewDate = assignment.reviewDate
    ? new Date(assignment.reviewDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null

  // Mock current user - in a real app, this would come from authentication
  const currentUser = {
    id: "user-1",
    isInstructor: true,
  }

  const canEdit = currentUser.isInstructor
  const canDelete = currentUser.isInstructor

  const toggleCompleted = () => {
    // In a real app, this would update the database
    setIsCompleted(!isCompleted)

    // This would be an API call in a real application
    console.log(`Assignment ${assignment.id} marked as ${!isCompleted ? "completed" : "incomplete"}`)

    // For demo purposes, we'll update the local state
    setAssignment({
      ...assignment,
      isCompleted: !isCompleted,
    })
  }

  // Add this component before the return statement
  function MemoEditor({ assignmentId }: { assignmentId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [memo, setMemo] = useState("")

    const handleSave = () => {
      // In a real app, this would save to a database
      console.log(`Saving memo for assignment ${assignmentId}: ${memo}`)

      // Auto-mark as completed when instructor adds a memo
      setIsCompleted(true)

      // Update the assignment with the new memo and completed status
      setAssignment({
        ...assignment,
        instructorMemo: memo,
        isCompleted: true,
      })

      alert(
        "Memo saved successfully! Assignment marked as completed. (This is a demo - in a real app, this would save to a database)",
      )
      setIsEditing(false)
    }

    if (isEditing) {
      return (
        <div className="space-y-4">
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
            placeholder="Enter instructor memo here..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 text-sm border border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button onClick={handleSave} className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800">
              Save Memo
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="flex items-center justify-between">
        <p className="text-gray-500 italic">No memo added yet.</p>
        <button onClick={() => setIsEditing(true)} className="text-sm underline">
          Add Memo
        </button>
      </div>
    )
  }

  // Function to determine file type icon and extension
  const getFileInfo = (filename: string) => {
    if (!filename) return { icon: Download, ext: "file" }

    const ext = filename.split(".").pop()?.toLowerCase()

    switch (ext) {
      case "pdf":
        return { icon: Download, ext: "PDF" }
      case "hwp":
        return { icon: Download, ext: "HWP" }
      case "txt":
        return { icon: Download, ext: "TXT" }
      default:
        return { icon: Download, ext: "file" }
    }
  }

  // Mock file attachment
  const fileAttachment = assignment.file || "assignment-document.pdf"
  const { icon: FileIcon, ext: fileExt } = getFileInfo(fileAttachment)

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4">
        <Link href="/board" className="inline-flex items-center text-sm mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to assignments
        </Link>

        <article className="max-w-3xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs px-2 py-1 ${
                  assignment.classLevel === "beginner"
                    ? "bg-gray-100"
                    : assignment.classLevel === "intermediate"
                      ? "bg-gray-200"
                      : "bg-gray-800 text-white"
                }`}
              >
                {assignment.classLevel.charAt(0).toUpperCase() + assignment.classLevel.slice(1)}
              </span>
              <div className="text-sm text-gray-500">{formattedDate}</div>
            </div>

            <h1 className="text-3xl font-light tracking-wider mb-6">{assignment.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Due Date</div>
                  <div>{assignment.dueDate}</div>
                </div>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase">Assigned By</div>
                  <div>{assignment.instructor}</div>
                </div>
              </div>
            </div>

            <div className="flex items-center mb-6">
              {isCompleted ? (
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Completed</span>
                </Badge>
              ) : (
                <Badge variant="outline" className="flex items-center gap-1">
                  <span>In Progress</span>
                </Badge>
              )}
              {formattedReviewDate && (
                <span className="ml-4 text-sm text-gray-500">Reviewed on {formattedReviewDate}</span>
              )}
            </div>

            {/* File attachment */}
            {fileAttachment && (
              <div className="mb-6">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-dashed"
                  onClick={() => alert("Downloading file... (This is a demo)")}
                >
                  <FileIcon className="h-4 w-4" />
                  <span>Download {fileExt} File</span>
                </Button>
              </div>
            )}
          </header>

          <div className="prose max-w-none mb-8">
            <h2 className="text-xl font-light tracking-wider mb-4">Description</h2>
            <div dangerouslySetInnerHTML={{ __html: assignment.descriptionHtml || assignment.description }} />
          </div>

          {currentUser.isInstructor && (
            <div className="mb-8 p-6 bg-gray-50 border-l-2 border-gray-300">
              <h2 className="text-xl font-light tracking-wider mb-4">Instructor Memo</h2>
              {assignment.instructorMemo ? (
                <p>{assignment.instructorMemo}</p>
              ) : (
                <MemoEditor assignmentId={assignment.id} />
              )}
            </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-gray-200 mb-8">
            <div className="flex items-center">
              {currentUser.isInstructor && (
                <Button
                  onClick={toggleCompleted}
                  variant={isCompleted ? "default" : "outline"}
                  className={`flex items-center gap-2 ${isCompleted ? "bg-black hover:bg-gray-800" : ""}`}
                >
                  {isCompleted ? (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      Completed
                    </>
                  ) : (
                    <>
                      <Square className="h-4 w-4" />
                      Mark as Complete
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {canEdit && (
                <Link
                  href={`/board/assignment/edit/${assignment.id}`}
                  className="flex items-center px-3 py-1 text-sm border border-gray-200 hover:bg-gray-50"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              )}
              {canDelete && (
                <button className="flex items-center px-3 py-1 text-sm border border-gray-200 hover:bg-gray-50 text-red-500">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              )}
            </div>
          </div>
        </article>
      </div>
    </main>
  )
}
