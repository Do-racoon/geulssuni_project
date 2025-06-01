"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase/client"
import { toast } from "@/hooks/use-toast"

interface Assignment {
  id: string
  title: string
  content: string
  description: string
  class_level: string
  due_date: string | null
  max_submissions: number | null
  password: string | null
  author_id: string
  instructor_id: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface EditAssignmentPageProps {
  params: {
    id: string
  }
}

export default function EditAssignmentPage({ params }: EditAssignmentPageProps) {
  const router = useRouter()
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    class_level: "",
    due_date: "",
    max_submissions: "",
    password: "",
  })

  useEffect(() => {
    console.log("🚀 Edit page useEffect triggered with params.id:", params.id)

    // 약간의 지연을 두고 세션 체크 (클라이언트 초기화 대기)
    const timer = setTimeout(() => {
      loadAssignmentAndUser()
    }, 100)

    return () => clearTimeout(timer)
  }, [params.id])

  const loadAssignmentAndUser = async () => {
    try {
      setIsLoading(true)
      const supabase = getSupabaseClient()

      // 먼저 localStorage에서 세션 정보 확인
      const localStorageSession = typeof window !== "undefined" ? localStorage.getItem("supabase.auth.token") : null
      console.log("💾 LocalStorage session exists:", !!localStorageSession)

      // 세션 새로고침 시도
      await supabase.auth.refreshSession()

      // 사용자 정보 가져오기 - getUser() 사용 (더 안정적)
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      console.log("🔍 Edit page user check:", {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        error: userError?.message,
      })

      if (userError || !user) {
        console.log("❌ No user in edit page, redirecting to login")

        // 세션 정보가 없으면 로그인 페이지로 리다이렉트
        router.push("/login")
        return
      }

      // 사용자 데이터 조회 - ID 우선, 실패시 이메일
      let userData = null

      // ID로 검색
      const { data: userByIdData, error: userByIdError } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", user.id)
        .single()

      if (userByIdError && user.email) {
        console.log("🔍 User not found by ID, trying email search...")
        // 이메일로 검색
        const { data: userByEmailData, error: userByEmailError } = await supabase
          .from("users")
          .select("id, name, email, role")
          .eq("email", user.email)
          .single()

        if (!userByEmailError && userByEmailData) {
          userData = userByEmailData
        }
      } else if (!userByIdError && userByIdData) {
        userData = userByIdData
      }

      console.log("👤 Edit page user data:", {
        found: !!userData,
        role: userData?.role,
        email: userData?.email,
      })

      if (!userData) {
        toast({
          title: "사용자 정보 오류",
          description: "사용자 정보를 찾을 수 없습니다.",
          variant: "destructive",
        })
        router.push("/login")
        return
      }

      setCurrentUser(userData)

      // 과제 정보 가져오기
      const { data: assignmentData, error: assignmentError } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", params.id)
        .single()

      console.log("📝 Assignment data check:", {
        found: !!assignmentData,
        authorId: assignmentData?.author_id,
        error: assignmentError?.message,
      })

      if (assignmentError || !assignmentData) {
        console.error("Error loading assignment:", assignmentError)
        toast({
          title: "Error",
          description: "Assignment not found",
          variant: "destructive",
        })
        router.push("/board")
        return
      }

      // 권한 체크 - 관리자이거나 본인이 작성한 과제인 경우만 편집 가능
      const isAdmin = userData.role === "admin"
      const isInstructor = userData.role === "instructor" || userData.role === "teacher"
      const isAuthor = assignmentData.author_id === userData.id

      console.log("🔐 Edit permission check:", {
        userRole: userData.role,
        isAdmin,
        isInstructor,
        isAuthor,
        assignmentAuthorId: assignmentData.author_id,
        userId: userData.id,
      })

      const canEdit = isAdmin || (isInstructor && isAuthor)

      if (!canEdit) {
        console.log("❌ Edit permission denied")
        toast({
          title: "Access Denied",
          description: "You don't have permission to edit this assignment",
          variant: "destructive",
        })
        router.push(`/board/assignment/${params.id}`)
        return
      }

      console.log("✅ Edit permission granted")
      setAssignment(assignmentData)

      // 폼 데이터 초기화
      setFormData({
        title: assignmentData.title || "",
        content: assignmentData.content || "",
        description: assignmentData.description || "",
        class_level: assignmentData.class_level || "",
        due_date: assignmentData.due_date ? assignmentData.due_date.split("T")[0] : "",
        max_submissions: assignmentData.max_submissions?.toString() || "",
        password: assignmentData.password || "",
      })
    } catch (error) {
      console.error("💥 Edit page load error:", error)
      toast({
        title: "Error",
        description: "Failed to load assignment",
        variant: "destructive",
      })
      router.push("/board")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      const supabase = getSupabaseClient()

      const updateData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.description.trim(),
        class_level: formData.class_level,
        due_date: formData.due_date || null,
        max_submissions: formData.max_submissions ? Number.parseInt(formData.max_submissions) : null,
        password: formData.password.trim() || null,
        updated_at: new Date().toISOString(),
      }

      // 필수 필드 검증
      if (!updateData.title) {
        toast({
          title: "Validation Error",
          description: "Title is required",
          variant: "destructive",
        })
        return
      }

      if (!updateData.description) {
        toast({
          title: "Validation Error",
          description: "Description is required",
          variant: "destructive",
        })
        return
      }

      if (!updateData.class_level) {
        toast({
          title: "Validation Error",
          description: "Class level is required",
          variant: "destructive",
        })
        return
      }

      const { error } = await supabase.from("assignments").update(updateData).eq("id", params.id)

      if (error) {
        console.error("Error updating assignment:", error)
        throw error
      }

      toast({
        title: "Success",
        description: "Assignment updated successfully",
      })

      router.push(`/board/assignment/${params.id}`)
    } catch (error) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/board/assignment/${params.id}`)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!assignment) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-12 px-4 max-w-4xl">
          <div className="text-center">
            <h1 className="text-2xl font-light mb-4">Assignment not found</h1>
            <p className="text-gray-600">The requested assignment does not exist or has been deleted.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <Link
            href={`/board/assignment/${params.id}`}
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors tracking-wider font-light mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            BACK TO ASSIGNMENT
          </Link>
          <h1 className="text-3xl font-light tracking-widest uppercase">Edit Assignment</h1>
        </div>

        {/* 편집 폼 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-light tracking-wider">Assignment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter assignment title"
                className="text-lg"
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter assignment description"
                rows={4}
              />
            </div>

            {/* 내용 */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Content
              </Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter detailed assignment content"
                rows={8}
              />
            </div>

            {/* 클래스 레벨, 마감일, 최대 제출 수 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="class_level" className="text-sm font-medium">
                  Class Level *
                </Label>
                <Select
                  value={formData.class_level}
                  onValueChange={(value) => setFormData({ ...formData, class_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">기초반</SelectItem>
                    <SelectItem value="Intermediate">중급반</SelectItem>
                    <SelectItem value="Advanced">전문반</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date" className="text-sm font-medium">
                  Due Date
                </Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_submissions" className="text-sm font-medium">
                  Max Submissions
                </Label>
                <Input
                  id="max_submissions"
                  type="number"
                  value={formData.max_submissions}
                  onChange={(e) => setFormData({ ...formData, max_submissions: e.target.value })}
                  placeholder="Unlimited"
                  min="1"
                />
              </div>
            </div>

            {/* 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password (Optional)
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty for no password protection"
              />
              <p className="text-xs text-gray-500">
                Set a password to protect this assignment. Students will need to enter this password to view the
                assignment.
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end gap-4 pt-6">
              <Button onClick={handleCancel} variant="outline" disabled={isSaving} className="flex items-center gap-2">
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
