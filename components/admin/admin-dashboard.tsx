"use client"

import { useState, useEffect, useRef } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AdminNavigation from "./admin-navigation"
import AdminOverview from "./sections/admin-overview"
import UserManagement from "./sections/user-management"
import LectureManagement from "./sections/lecture-management"
import BookManagement from "./sections/book-management"
import AssignmentReview from "./sections/assignment-review"
import FAQManagement from "./sections/faq-management"
import AdminSettings from "./sections/admin-settings"
import BoardManagement from "./sections/board-management"
import AuthorsManagement from "./sections/writers-management"
import PortfolioManagement from "./sections/portfolio-management"

export type AdminSection =
  | "overview"
  | "users"
  | "lectures"
  | "books"
  | "assignments"
  | "faq"
  | "settings"
  | "board"
  | "authors"
  | "portfolio"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const authCheckCompletedRef = useRef(false)
  const authCheckInProgressRef = useRef(false)

  const supabase = createClientComponentClient()

  const checkAuth = async () => {
    if (authCheckInProgressRef.current || authCheckCompletedRef.current) {
      return
    }

    authCheckInProgressRef.current = true

    try {
      setLoading(true)

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session) {
        throw new Error(sessionError?.message || "세션이 없습니다")
      }

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, email, name, is_active")
        .eq("id", session.user.id)
        .single()

      if (userError) {
        throw new Error(`사용자 정보 조회 실패: ${userError.message}`)
      }

      if (userData.role !== "admin") {
        throw new Error("관리자 권한이 없습니다")
      }

      authCheckCompletedRef.current = true
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증 확인 중 오류가 발생했습니다")
      window.location.href = "/admin/login"
    } finally {
      setLoading(false)
      authCheckInProgressRef.current = false
    }
  }

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.href = "/admin/login"
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSectionChange = (section: AdminSection) => {
    if (authCheckCompletedRef.current) {
      setActiveSection(section)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>관리자 정보를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <div className="text-red-500 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-xl font-bold text-center">인증 오류</h2>
          </div>
          <p className="text-gray-700 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => (window.location.href = "/admin/login")}
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              로그인 페이지로 이동
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminNavigation activeSection={activeSection} onSectionChange={handleSectionChange} />

      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {activeSection === "overview" && <AdminOverview />}
          {activeSection === "users" && <UserManagement />}
          {activeSection === "lectures" && <LectureManagement />}
          {activeSection === "books" && <BookManagement />}
          {activeSection === "assignments" && <AssignmentReview />}
          {activeSection === "faq" && <FAQManagement />}
          {activeSection === "settings" && <AdminSettings />}
          {activeSection === "board" && <BoardManagement />}
          {activeSection === "authors" && <AuthorsManagement />}
          {activeSection === "portfolio" && <PortfolioManagement />}
        </div>
      </div>
    </div>
  )
}
