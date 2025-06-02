"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSupabaseAuth } from "@/lib/supabase/provider"
import AssignmentEditor from "@/components/board/assignment-editor"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Assignment {
  id: string
  title: string
  content: string
  class_level: string
  due_date: string | null
  max_submissions: number | null
  allow_late_submission: boolean
  late_penalty: number | null
  is_group_assignment: boolean
  max_group_size: number | null
  rubric: any
  instructions: string | null
  created_by: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  email: string
  role: string
  name: string
}

export default function EditAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getSession, getUser, supabase } = useSupabaseAuth()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAssignmentAndUser()
  }, [params.id])

  const loadAssignmentAndUser = async () => {
    try {
      console.log("🚀 Edit page useEffect triggered with params.id:", params.id)
      setLoading(true)

      // 1. 세션 체크
      const { session, error: sessionError } = await getSession()
      console.log("🔍 Edit page session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError,
      })

      if (!session) {
        console.log("❌ No session in edit page, redirecting to login")
        router.push("/login")
        return
      }

      // 2. 사용자 정보 가져오기
      let userData: User | null = null

      // ID로 사용자 검색
      const { data: userById, error: userByIdError } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (userById) {
        userData = userById
        console.log("✅ User found by ID:", userData)
      } else {
        console.log("⚠️ User not found by ID, trying email:", userByIdError)
        // 이메일로 사용자 검색
        const { data: userByEmail, error: userByEmailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", session.user.email)
          .single()

        if (userByEmail) {
          userData = userByEmail
          console.log("✅ User found by email:", userData)
        } else {
          console.log("❌ User not found by email either:", userByEmailError)
          setError("사용자 정보를 찾을 수 없습니다.")
          return
        }
      }

      setUser(userData)

      // 3. 과제 정보 가져오기
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", params.id)
        .single()

      if (assignmentError) {
        console.error("❌ Assignment fetch error:", assignmentError)
        setError("과제를 찾을 수 없습니다.")
        return
      }

      console.log("📝 Assignment data:", assignmentData)
      setAssignment(assignmentData)

      // 4. 권한 체크
      const isAdmin = userData.role === "admin"
      const isInstructor = userData.role === "instructor"
      const isCreator = assignmentData.created_by === userData.id

      console.log("🔐 Permission check:", {
        userRole: userData.role,
        isAdmin,
        isInstructor,
        isCreator,
        assignmentCreatedBy: assignmentData.created_by,
        userId: userData.id,
      })

      if (!isAdmin && (!isInstructor || !isCreator)) {
        console.log("❌ No permission to edit this assignment")
        setError("이 과제를 편집할 권한이 없습니다.")
        return
      }

      console.log("✅ All checks passed, assignment loaded successfully")
    } catch (error) {
      console.error("❌ Error in loadAssignmentAndUser:", error)
      setError("데이터를 불러오는 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <Button onClick={() => router.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!assignment || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg">과제 정보를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button onClick={() => router.back()} variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>
        <h1 className="text-3xl font-bold">과제 편집</h1>
      </div>

      <AssignmentEditor assignment={assignment} user={user} />
    </div>
  )
}
