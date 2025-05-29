"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Lock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import AssignmentDetail from "@/components/board/assignment-detail"
import { supabase } from "@/lib/supabase/client"

interface AssignmentDetailPageProps {
  params: {
    id: string
  }
}

interface Assignment {
  id: string
  title: string
  description: string
  author_id: string
  password?: string
}

interface User {
  id: string
  role: string
}

export default function AssignmentDetailPage({ params }: AssignmentDetailPageProps) {
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isPasswordRequired, setIsPasswordRequired] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    loadAssignmentAndUser()
  }, [params.id])

  const loadAssignmentAndUser = async () => {
    try {
      // 현재 사용자 정보 가져오기
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: userData } = await supabase.from("users").select("id, role").eq("id", user.id).single()

        setCurrentUser(userData)
      }

      // assignments 테이블에서 직접 가져오기
      const { data: assignmentData, error } = await supabase
        .from("assignments")
        .select("id, title, description, author_id, password")
        .eq("id", params.id)
        .single()

      if (error) {
        console.error("Error loading assignment:", error)
        return
      }

      setAssignment(assignmentData)

      // 비밀번호 보호 확인
      const isAdmin = currentUser?.role === "admin"
      const isInstructor = currentUser?.role === "instructor"
      const isAuthor = currentUser?.id === assignmentData.author_id
      const hasPassword = assignmentData.password && assignmentData.password.trim() !== ""

      // 관리자, 강사, 작성자가 아니고 비밀번호가 있으면 비밀번호 입력 필요
      if (hasPassword && !isAdmin && !isInstructor && !isAuthor) {
        setIsPasswordRequired(true)
      } else {
        setIsVerified(true)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError("")

    if (!passwordInput.trim()) {
      setPasswordError("비밀번호를 입력해주세요.")
      return
    }

    if (!assignment || !assignment.password) return

    // 클라이언트에서 비밀번호 확인
    if (passwordInput.trim() === assignment.password.trim()) {
      setIsVerified(true)
      setIsPasswordRequired(false)
    } else {
      setPasswordError("비밀번호가 올바르지 않습니다.")
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-12 px-4 max-w-5xl">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">로딩 중...</div>
          </div>
        </div>
      </main>
    )
  }

  if (!assignment) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-12 px-4 max-w-5xl">
          <div className="mb-8">
            <Link
              href="/board"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO BOARD
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-light mb-4">과제를 찾을 수 없습니다</h1>
            <p className="text-gray-600">요청하신 과제가 존재하지 않거나 삭제되었습니다.</p>
          </div>
        </div>
      </main>
    )
  }

  if (isPasswordRequired && !isVerified) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-12 px-4 max-w-5xl">
          <div className="mb-8">
            <Link
              href="/board"
              className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              BACK TO BOARD
            </Link>
          </div>

          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="w-full max-w-md">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-light tracking-wider mb-2">비밀번호 보호</h2>
                  <p className="text-gray-600">
                    이 과제는 비밀번호로 보호되어 있습니다.
                    <br />
                    비밀번호를 입력해주세요.
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                      className="text-center"
                    />
                    {passwordError && (
                      <div className="flex items-center text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {passwordError}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full">
                    확인
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4 max-w-5xl">
        {/* 뒤로가기 버튼 */}
        <div className="mb-8">
          <Link
            href="/board"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO BOARD
          </Link>
        </div>

        {/* 과제 상세 정보 */}
        <AssignmentDetail assignmentId={params.id} />
      </div>
    </main>
  )
}
