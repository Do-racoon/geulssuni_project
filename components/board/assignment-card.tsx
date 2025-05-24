"use client"

import type React from "react"

import Link from "next/link"
import { CheckSquare, Square, Calendar, User } from "lucide-react"
import type { AssignmentPost } from "@/data/board-posts"

interface AssignmentCardProps {
  assignment: AssignmentPost
  onComplete: (postId: string) => void
  isInstructor: boolean
}

export default function AssignmentCard({ assignment, onComplete, isInstructor }: AssignmentCardProps) {
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
      })
    : "Not reviewed yet"

  const handleComplete = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking the button
    onComplete(assignment.id)
  }

  return (
    <div className={`border ${assignment.isCompleted ? "border-gray-300 bg-gray-50" : "border-gray-200 bg-white"}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
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

              {assignment.isCompleted && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800">Completed</span>
              )}
            </div>
            <Link href={`/board/assignment/${assignment.id}`} className="block">
              <h3 className="text-xl font-light tracking-wider hover:underline">{assignment.title}</h3>
            </Link>
          </div>
          <div className="text-xs text-gray-500">{formattedDate}</div>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 line-clamp-3">{assignment.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <div>
              <div className="text-xs uppercase">Due Date</div>
              <div>{assignment.dueDate}</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <User className="h-4 w-4 mr-2" />
            <div>
              <div className="text-xs uppercase">Assigned By</div>
              <div>{assignment.instructor}</div>
            </div>
          </div>
        </div>

        {isInstructor && assignment.instructorMemo && (
          <div className="mb-4 p-3 bg-gray-50 border-l-2 border-gray-300">
            <div className="text-xs uppercase mb-1">Instructor Memo</div>
            <p className="text-sm text-gray-700">{assignment.instructorMemo}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={handleComplete}
              className={`flex items-center text-sm px-3 py-1.5 rounded-sm ${
                assignment.isCompleted
                  ? "bg-black text-white hover:bg-gray-800"
                  : "border border-gray-200 hover:bg-gray-50"
              }`}
              disabled={!isInstructor}
            >
              {assignment.isCompleted ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Mark as Complete</span>
                </>
              )}
            </button>
          </div>

          {assignment.reviewDate && (
            <div className="text-xs text-gray-500">
              <span className="block">Reviewed:</span>
              <span>{formattedReviewDate}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
