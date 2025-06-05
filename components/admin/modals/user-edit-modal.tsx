"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { toast } from "sonner"

interface User {
  id: string
  name: string
  email: string
  phone: string
  class_level: string | null
  role: "user" | "instructor" | "admin"
  created_at: string
  is_active: boolean
  email_verified: boolean
  nickname?: string
}

interface UserEditModalProps {
  user: User
  onClose: () => void
  onSave: (updatedUser: User) => void
}

export default function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<User>({ ...user })
  const [classLevels, setClassLevels] = useState<string[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  // 실제 사용 중인 클래스 레벨 옵션 (enum 값들)
  const knownClassLevels = ["Beginner", "Intermediate", "Advanced", "admin"]

  // 역할 옵션
  const roleOptions = [
    { value: "user", label: "학생", description: "일반 학생 계정" },
    { value: "instructor", label: "강사", description: "강의를 진행하는 강사" },
    { value: "admin", label: "관리자", description: "시스템 관리자" },
  ]

  // enum 안전하게 클래스 레벨들 가져오기
  const loadClassLevels = async () => {
    try {
      setLoadingClasses(true)
      console.log("클래스 레벨 로딩 시작...")

      // enum 타입이므로 안전하게 특정 값들만 조회
      const { data, error } = await supabase.from("users").select("class_level").in("class_level", knownClassLevels) // enum 값들만 조회

      if (error) {
        console.error("클래스 레벨 조회 오류:", error)
        // 오류 발생 시 알려진 값들 사용
        setClassLevels(knownClassLevels)
        return
      }

      if (data && data.length > 0) {
        // 실제 사용 중인 값들만 추출
        const usedClassLevels = [...new Set(data.map((item) => item.class_level).filter(Boolean))]

        // 알려진 값들과 합치기 (중복 제거)
        const allClassLevels = [...new Set([...knownClassLevels, ...usedClassLevels])]

        setClassLevels(allClassLevels.sort())
        console.log("로드된 클래스 레벨:", allClassLevels)
      } else {
        // 데이터가 없으면 알려진 값들 사용
        setClassLevels(knownClassLevels)
        console.log("데이터 없음, 기본값 사용:", knownClassLevels)
      }
    } catch (error) {
      console.error("클래스 레벨 로드 오류:", error)
      // 모든 오류 상황에서 알려진 값들 사용
      setClassLevels(knownClassLevels)
      toast.error("클래스 목록을 불러오는데 실패했습니다. 기본값을 사용합니다.")
    } finally {
      setLoadingClasses(false)
    }
  }

  useEffect(() => {
    loadClassLevels()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData({
      ...formData,
      [name]: value === "" ? null : value, // 빈 문자열을 null로 변환
    })
  }

  const handleBooleanChange = (field: "is_active" | "email_verified", value: boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // 유효성 검사
    if (!formData.name.trim()) {
      toast.error("이름을 입력해주세요.")
      return
    }

    if (!formData.email.trim()) {
      toast.error("이메일을 입력해주세요.")
      return
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error("올바른 이메일 형식을 입력해주세요.")
      return
    }

    console.log("저장할 사용자 데이터:", formData)
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-md shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto m-4">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-light">사용자 정보 수정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
              <input
                type="text"
                name="nickname"
                value={formData.nickname || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="선택사항"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이메일 <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">전화번호</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="010-0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                역할 <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                required
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </div>

            {(formData.role === "user" || formData.role === "instructor") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === "user" ? "수강 클래스" : "담당 클래스"}
                </label>
                {loadingClasses ? (
                  <div className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-500">
                    클래스 목록 로딩 중...
                  </div>
                ) : (
                  <select
                    name="class_level"
                    value={formData.class_level || ""}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="">클래스 미지정</option>
                    {classLevels.map((level) => (
                      <option key={level} value={level}>
                        {level === "admin" ? "관리자 클래스" : level}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계정 상태</label>
              <select
                value={formData.is_active ? "active" : "inactive"}
                onChange={(e) => handleBooleanChange("is_active", e.target.value === "active")}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="active">활성 - 정상적으로 사용 가능</option>
                <option value="inactive">비활성 - 로그인 제한</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일 인증</label>
              <select
                value={formData.email_verified ? "verified" : "unverified"}
                onChange={(e) => handleBooleanChange("email_verified", e.target.value === "verified")}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="verified">인증됨 - 이메일 인증 완료</option>
                <option value="unverified">미인증 - 이메일 인증 필요</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
              <input
                type="text"
                value={new Date(formData.created_at).toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                className="w-full p-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">가입일은 수정할 수 없습니다</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
