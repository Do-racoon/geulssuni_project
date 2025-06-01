"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Eye, EyeOff, Upload, X } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { toast } from "sonner"

interface AssignmentCreateModalProps {
  onAssignmentCreated: () => void
}

export default function AssignmentCreateModal({ onAssignmentCreated }: AssignmentCreateModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    class_level: "",
    password: "",
    category: "general",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // class_level 매핑 함수 추가
  const mapClassLevel = (level: string) => {
    const mapping = {
      beginner: "Beginner", // beginner -> Beginner
      intermediate: "Intermediate", // intermediate -> Intermediate
      advanced: "Advanced", // advanced -> Advanced
    }
    return mapping[level] || level
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "과제 제목을 입력해주세요"
    }

    if (!formData.class_level) {
      newErrors.class_level = "난이도를 선택해주세요"
    }

    if (!formData.content.trim()) {
      newErrors.content = "과제 내용을 입력해주세요"
    }

    if (!formData.password.trim()) {
      newErrors.password = "과제 비밀번호를 입력해주세요"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles((prev) => [...prev, ...files])
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("🔍 폼 검증 결과:", validateForm())
    console.log("🔍 현재 폼 데이터:", formData)

    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요")
      return
    }

    setLoading(true)

    try {
      console.log("🚀 과제 등록 시작...")

      // Supabase 클라이언트 생성
      const supabase = createClientComponentClient()

      // 현재 세션 확인
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        console.error("❌ 세션 없음:", sessionError)
        toast.error("로그인이 필요합니다")
        return
      }

      console.log("✅ 세션 존재:", session.user.email)

      // 사용자 프로필 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, email, role, class_level")
        .eq("id", session.user.id)
        .single()

      if (userError || !userData) {
        console.error("❌ 사용자 프로필 조회 실패:", userError)
        toast.error("사용자 정보를 찾을 수 없습니다")
        return
      }

      console.log("👤 현재 사용자:", userData)

      // 과제 데이터 준비 (class_level 매핑 적용)
      const mappedClassLevel = mapClassLevel(formData.class_level)
      console.log("🔄 class_level 매핑:", formData.class_level, "->", mappedClassLevel)

      const assignmentData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.content.trim(),
        class_level: mappedClassLevel, // 매핑된 값 사용
        password: formData.password,
        author_id: userData.id,
        instructor_id: userData.id,
      }

      console.log("📝 과제 데이터:", assignmentData)
      console.log("📝 과제 데이터 전송 시작:", JSON.stringify(assignmentData, null, 2))

      // API 호출
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(assignmentData),
      })

      console.log("📡 API 응답 상태:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("✅ 과제 등록 성공:", result)

        toast.success("과제가 성공적으로 등록되었습니다! 🎉")

        // 폼 초기화
        setFormData({
          title: "",
          content: "",
          class_level: "",
          password: "",
          category: "general",
        })
        setSelectedFiles([])
        setErrors({})

        // 모달 닫기
        setOpen(false)

        // 부모 컴포넌트에 새로고침 요청
        onAssignmentCreated()
      } else {
        // 에러 응답을 더 자세히 확인
        const contentType = response.headers.get("content-type")
        let errorMessage = ""

        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          errorMessage = errorData.error || errorData.message || "알 수 없는 오류"
          console.error("❌ JSON 에러 응답:", errorData)
        } else {
          const errorText = await response.text()
          errorMessage = errorText
          console.error("❌ 텍스트 에러 응답:", errorText)
        }

        toast.error(`과제 등록 실패: ${errorMessage}`)
        return
      }
    } catch (error) {
      console.error("💥 과제 등록 오류:", error)
      toast.error(`과제 등록 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      class_level: "",
      password: "",
      category: "general",
    })
    setSelectedFiles([])
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />새 과제 등록
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">새 과제 등록 📝</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">작성</TabsTrigger>
            <TabsTrigger value="preview">미리보기</TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">과제 제목 *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="과제 제목을 입력하세요"
                        className={errors.title ? "border-red-500" : ""}
                      />
                      {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="class_level">난이도 *</Label>
                      <Select
                        value={formData.class_level}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, class_level: value }))}
                      >
                        <SelectTrigger className={errors.class_level ? "border-red-500" : ""}>
                          <SelectValue placeholder="난이도를 선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">기초반</SelectItem>
                          <SelectItem value="intermediate">중급반</SelectItem>
                          <SelectItem value="advanced">전문반</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.class_level && <p className="text-sm text-red-500">{errors.class_level}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">과제 비밀번호 *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="과제 확인용 비밀번호를 입력하세요"
                        className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* 과제 내용 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">과제 내용</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content">과제 설명 *</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                      placeholder="과제에 대한 자세한 설명을 입력하세요..."
                      rows={8}
                      className={errors.content ? "border-red-500" : ""}
                    />
                    {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                  </div>

                  {/* 파일 첨부 */}
                  <div className="space-y-2">
                    <Label htmlFor="files">첨부파일</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <input id="files" type="file" multiple onChange={handleFileSelect} className="hidden" />
                      <label htmlFor="files" className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">클릭하여 파일을 선택하세요</p>
                      </label>
                    </div>

                    {selectedFiles.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">선택된 파일:</p>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm">{file.name}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 버튼 */}
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={resetForm} disabled={loading}>
                  초기화
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                  취소
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "등록 중..." : "과제 등록"}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{formData.title || "과제 제목"}</CardTitle>
                <div className="flex gap-2">
                  {formData.class_level && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                      {formData.class_level === "beginner" && "기초반"}
                      {formData.class_level === "intermediate" && "중급반"}
                      {formData.class_level === "advanced" && "전문반"}
                    </span>
                  )}
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">assignment</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap">{formData.content || "과제 내용이 여기에 표시됩니다..."}</div>
                {formData.password && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm text-yellow-800">🔒 이 과제는 비밀번호로 보호됩니다</p>
                  </div>
                )}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">첨부파일:</p>
                    <div className="space-y-1">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
