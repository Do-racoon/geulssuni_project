"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Save, Calendar, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    level: "",
    due_date: "",
    max_submissions: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.level ||
      !formData.due_date ||
      formData.max_submissions <= 0
    ) {
      toast.error("모든 필수 필드를 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          description: formData.content.trim().substring(0, 200),
          class_level: formData.level,
          due_date: formData.due_date,
          max_submissions: formData.max_submissions,
        }),
      })

      if (response.ok) {
        toast.success("과제가 성공적으로 등록되었습니다!")
        router.push("/board")
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || "과제 등록에 실패했습니다.")
      }
    } catch (error) {
      console.error("과제 등록 오류:", error)
      toast.error("과제 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const minDateTime = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="container mx-auto py-12 px-4">
        {/* 뒤로가기 버튼 */}
        <Link
          href="/board"
          className="inline-flex items-center text-gray-600 hover:text-black transition-colors mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          게시판으로 돌아가기
        </Link>

        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-black mb-4 tracking-widest uppercase">NEW ASSIGNMENT</h1>
          <p className="text-gray-600 tracking-wide">CREATE A NEW ASSIGNMENT FOR STUDENTS</p>
        </div>

        {/* 폼 */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-black" style={{ borderRadius: "0" }}>
            <CardHeader className="border-b border-black">
              <CardTitle className="text-xl font-light tracking-widest uppercase">ASSIGNMENT DETAILS</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 제목 */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="text-sm font-light tracking-widest uppercase">
                    ASSIGNMENT TITLE *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter assignment title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="text-lg border-black focus:border-black focus:ring-0 font-light"
                    style={{ borderRadius: "0" }}
                    required
                  />
                </div>

                {/* 난이도 */}
                <div className="space-y-3">
                  <Label className="text-sm font-light tracking-widest uppercase">DIFFICULTY LEVEL *</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, level: value }))}
                    required
                  >
                    <SelectTrigger
                      className="border-black focus:border-black focus:ring-0"
                      style={{ borderRadius: "0" }}
                    >
                      <SelectValue placeholder="Select difficulty level" />
                    </SelectTrigger>
                    <SelectContent style={{ borderRadius: "0" }}>
                      <SelectItem value="beginner">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-white text-black border border-black" style={{ borderRadius: "0" }}>
                            BASIC
                          </Badge>
                          <span>For programming beginners</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="intermediate">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-black text-white border border-black" style={{ borderRadius: "0" }}>
                            INTERMEDIATE
                          </Badge>
                          <span>For intermediate learners</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="advanced">
                        <div className="flex items-center gap-3">
                          <Badge
                            className="bg-gray-800 text-white border border-gray-800"
                            style={{ borderRadius: "0" }}
                          >
                            ADVANCED
                          </Badge>
                          <span>For advanced developers</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 마감일과 최대 제출 인원 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label
                      htmlFor="due_date"
                      className="text-sm font-light tracking-widest uppercase flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      DUE DATE *
                    </Label>
                    <Input
                      id="due_date"
                      type="datetime-local"
                      min={minDateTime}
                      value={formData.due_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, due_date: e.target.value }))}
                      className="border-black focus:border-black focus:ring-0 font-light"
                      style={{ borderRadius: "0" }}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label
                      htmlFor="max_submissions"
                      className="text-sm font-light tracking-widest uppercase flex items-center gap-2"
                    >
                      <Users className="h-4 w-4" />
                      MAX SUBMISSIONS *
                    </Label>
                    <Input
                      id="max_submissions"
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="0"
                      value={formData.max_submissions || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, max_submissions: Number.parseInt(e.target.value) || 0 }))
                      }
                      className="border-black focus:border-black focus:ring-0 font-light"
                      style={{ borderRadius: "0" }}
                      required
                    />
                  </div>
                </div>

                {/* 내용 */}
                <div className="space-y-3">
                  <Label htmlFor="content" className="text-sm font-light tracking-widest uppercase">
                    ASSIGNMENT CONTENT *
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Enter assignment description, requirements, submission guidelines..."
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    className="min-h-[200px] resize-none border-black focus:border-black focus:ring-0 font-light"
                    style={{ borderRadius: "0" }}
                    required
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="flex justify-between items-center pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="border-black text-black bg-white hover:bg-black hover:text-white tracking-widest uppercase font-light"
                    style={{ borderRadius: "0" }}
                  >
                    CANCEL
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 min-w-[150px] bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
                    style={{ borderRadius: "0" }}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? "CREATING..." : "CREATE ASSIGNMENT"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
