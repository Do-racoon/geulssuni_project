"use client"

import type React from "react"

import { useState } from "react"
import { CheckCircle, Circle, Users, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Assignment {
  id: string
  title: string
  content: string
  category: string
  author?: {
    name: string
    avatar?: string
  }
  created_at: string
  assignments?: {
    class_level: string
    is_completed: boolean
    submissions_count: number
    total_students: number
  }
  password?: string
}

interface AssignmentCardProps {
  assignment: Assignment
  onComplete: (id: string) => void
  isInstructor: boolean
}

export default function AssignmentCard({ assignment, onComplete, isInstructor }: AssignmentCardProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const getLevelBadge = (level: string) => {
    const levelMap: Record<string, { label: string; color: string }> = {
      beginner: { label: "기초반", color: "bg-green-100 text-green-800" },
      intermediate: { label: "중급반", color: "bg-yellow-100 text-yellow-800" },
      advanced: { label: "전문반", color: "bg-red-100 text-red-800" },
    }

    const levelInfo = levelMap[level] || { label: level, color: "bg-gray-100 text-gray-800" }
    return <Badge className={`${levelInfo.color} border-0`}>{levelInfo.label}</Badge>
  }

  const handlePasswordSubmit = () => {
    if (passwordInput === assignment.password) {
      setIsPasswordDialogOpen(false)
      setPasswordInput("")
      setPasswordError("")
      // 비밀번호가 맞으면 과제 상세 페이지로 이동
      window.location.href = `/board/assignment/${assignment.id}`
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.")
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (assignment.password && !isInstructor) {
      setIsPasswordDialogOpen(true)
    } else {
      // 관리자이거나 비밀번호가 없으면 바로 이동
      window.location.href = `/board/assignment/${assignment.id}`
    }
  }

  const formattedDate = new Date(assignment.created_at).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return (
    <>
      <div
        className="border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {assignment.assignments && getLevelBadge(assignment.assignments.class_level)}
                {assignment.password && (
                  <Badge className="bg-blue-100 text-blue-800 border-0 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    보호됨
                  </Badge>
                )}
              </div>
              <h3 className="text-xl font-light tracking-wider hover:underline mb-2">{assignment.title}</h3>
              <p className="text-gray-600 line-clamp-2 mb-4">
                {assignment.content.replace(/📎 첨부파일:.*|📝 검토자 노트:.*/g, "").trim()}
              </p>
            </div>
            <div className="text-xs text-gray-500 ml-4">{formattedDate}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center text-sm text-gray-600">
                <span>작성자: {assignment.author?.name || "Unknown"}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {assignment.assignments && (
                <>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="h-4 w-4 mr-1" />
                    <span>
                      {assignment.assignments.submissions_count}/{assignment.assignments.total_students}
                    </span>
                  </div>

                  {isInstructor && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onComplete(assignment.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className={`flex items-center ${
                        assignment.assignments.is_completed ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {assignment.assignments.is_completed ? (
                        <CheckCircle className="h-4 w-4 mr-1" />
                      ) : (
                        <Circle className="h-4 w-4 mr-1" />
                      )}
                      {assignment.assignments.is_completed ? "완료됨" : "미완료"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 확인 다이얼로그 */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              과제 비밀번호 입력
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">이 과제는 비밀번호로 보호되어 있습니다. 비밀번호를 입력해주세요.</p>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  setPasswordError("")
                }}
                placeholder="비밀번호를 입력하세요"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handlePasswordSubmit()
                  }
                }}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPasswordDialogOpen(false)
                  setPasswordInput("")
                  setPasswordError("")
                }}
              >
                취소
              </Button>
              <Button onClick={handlePasswordSubmit}>확인</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
