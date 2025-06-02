"use client"

import type React from "react"
import { useState } from "react"
import { X, Copy } from "lucide-react"
import { createLecture } from "@/lib/api/lectures"
import { toast } from "sonner"

interface Lecture {
  id: string
  title: string
  instructor: string
  category: string
  description?: string
  content?: string
  thumbnail_url?: string
  duration?: number | string
  location?: string
  capacity?: number
}

interface CopyLectureModalProps {
  lecture: Lecture
  onClose: () => void
  onSuccess: () => void
}

export default function CopyLectureModal({ lecture, onClose, onSuccess }: CopyLectureModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  // Initialize form fields with lecture data (excluding instructor)
  const [formData, setFormData] = useState({
    title: `${lecture.title} (복사본)`,
    category: lecture.category || "beginner",
    description: lecture.description || "",
    content: lecture.content || "",
    duration: lecture.duration || 0,
    thumbnail_url: lecture.thumbnail_url || "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      console.log("Submitting form data:", formData)

      // Create lecture without instructor (will be set to null)
      const lectureData = {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        content: formData.content,
        thumbnail_url: formData.thumbnail_url,
        duration: formData.duration,
        status: "draft", // New copies start as draft
        // instructor_id will be set to null in the API
      }

      console.log("Creating lecture with data:", lectureData)

      await createLecture(lectureData)

      toast.success("강의가 복사되었습니다. 강사는 나중에 수정에서 설정할 수 있습니다.")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error copying lecture:", error)
      toast.error(`강의 복사에 실패했습니다: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Copy className="h-5 w-5" />
            강의 복사
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                새 강의 제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="special Sessions">Special Sessions</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                수업 시간 (분)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                설명
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-medium text-blue-900 mb-2">복사될 내용:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 제목: {formData.title}</li>
                <li>• 카테고리: {formData.category}</li>
                <li>• 설명: {formData.description ? "포함" : "없음"}</li>
                <li>• 강의 내용: {formData.content ? "포함" : "없음"}</li>
                <li>• 수업 시간: {formData.duration}분</li>
                <li>• 썸네일: {formData.thumbnail_url ? "포함" : "없음"}</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>참고:</strong> 강의가 초안(draft) 상태로 복사되며, 강사는 설정되지 않습니다. 복사 후 수정 기능을
                통해 강사를 추가할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              {isLoading ? "복사 중..." : "복사하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
