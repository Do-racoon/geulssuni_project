"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import { createAuthor } from "@/lib/api/authors"
import { toast } from "@/hooks/use-toast"

interface AddAuthorModalProps {
  onClose: () => void
}

export default function AddAuthorModal({ onClose }: AddAuthorModalProps) {
  const [name, setName] = useState("")
  const [profession, setProfession] = useState("")
  const [experience, setExperience] = useState("")
  const [quote, setQuote] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [numberWorks, setNumberWorks] = useState(0)
  const [imagePositionX, setImagePositionX] = useState(50)
  const [imagePositionY, setImagePositionY] = useState(50)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!name) {
        throw new Error("이름은 필수입니다")
      }

      console.log("저자 생성 시도:", {
        name,
        profession,
        experience,
        number_of_works: numberWorks,
        quote,
        instagram_url: instagramUrl || undefined,
        image_url: profileImage || undefined,
        image_position_x: imagePositionX,
        image_position_y: imagePositionY,
        likes: 0,
      })

      const response = await createAuthor({
        name,
        profession,
        experience,
        number_of_works: numberWorks,
        quote,
        instagram_url: instagramUrl || undefined,
        image_url: profileImage || undefined,
        image_position_x: imagePositionX,
        image_position_y: imagePositionY,
        likes: 0,
      })

      console.log("저자 생성 응답:", response)

      toast({
        title: "저자 생성 완료",
        description: "저자가 성공적으로 생성되었습니다.",
      })

      onClose()
      // 부모 컴포넌트에서 데이터 새로고침하도록 이벤트 발생
      window.dispatchEvent(new CustomEvent("author-updated"))
    } catch (error) {
      console.error("저자 생성 오류:", error)
      setError(error instanceof Error ? error.message : "저자 생성 중 오류가 발생했습니다")
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "저자 생성 중 오류가 발생했습니다",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Simulate image upload
  const handleProfileImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For demo purposes, we'll just set a placeholder image
    setProfileImage("/placeholder.svg?height=200&width=200")
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">새 저자 추가</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 text-center">프로필 이미지</p>
                  <div className="h-32 w-32 rounded-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <Image src={profileImage || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="text-gray-400 text-xs text-center p-4">이미지 없음</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleProfileImageUpload}
                    className="mt-2 w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    업로드
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                  직업
                </label>
                <input
                  type="text"
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                  경력
                </label>
                <textarea
                  id="experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                  인용구
                </label>
                <textarea
                  id="quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  인스타그램 URL
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label htmlFor="numberWorks" className="block text-sm font-medium text-gray-700 mb-1">
                  작품 수
                </label>
                <input
                  type="number"
                  id="numberWorks"
                  value={numberWorks}
                  onChange={(e) => setNumberWorks(Number.parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="imagePositionX" className="block text-sm font-medium text-gray-700 mb-1">
                    이미지 X 위치 (%)
                  </label>
                  <input
                    type="number"
                    id="imagePositionX"
                    value={imagePositionX}
                    onChange={(e) => setImagePositionX(Number.parseInt(e.target.value) || 50)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
                <div>
                  <label htmlFor="imagePositionY" className="block text-sm font-medium text-gray-700 mb-1">
                    이미지 Y 위치 (%)
                  </label>
                  <input
                    type="number"
                    id="imagePositionY"
                    value={imagePositionY}
                    onChange={(e) => setImagePositionY(Number.parseInt(e.target.value) || 50)}
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "처리 중..." : "저자 추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
