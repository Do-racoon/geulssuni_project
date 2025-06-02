"use client"

import type React from "react"
import { useState } from "react"
import { X } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  phone: string
  class_name: string
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
              <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">역할</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="user">학생</option>
                <option value="instructor">강사</option>
                <option value="admin">관리자</option>
              </select>
            </div>

            {(formData.role === "user" || formData.role === "instructor") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.role === "user" ? "수강 클래스" : "담당 클래스"}
                </label>
                <select
                  name="class_name"
                  value={formData.class_name || ""}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="">클래스 선택</option>
                  <option value="Beginner">기초반</option>
                  <option value="Intermediate">중급반</option>
                  <option value="Advanced">고급반</option>
                  <option value="Special">특별반</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                name="is_active"
                value={formData.is_active ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="true">활성</option>
                <option value="false">비활성</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일 인증</label>
              <select
                name="email_verified"
                value={formData.email_verified ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, email_verified: e.target.value === "true" })}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="true">인증됨</option>
                <option value="false">미인증</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">가입일</label>
              <input
                type="text"
                value={new Date(formData.created_at).toLocaleDateString("ko-KR")}
                className="w-full p-2 border border-gray-200 rounded-md bg-gray-50"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">가입일은 수정할 수 없습니다</p>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50"
            >
              취소
            </button>
            <button type="submit" className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
