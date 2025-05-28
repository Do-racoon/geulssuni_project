"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import AdminDashboard from "@/components/admin/admin-dashboard"
import AdminLoginForm from "@/components/admin/admin-login-form"
import AdminDebug from "@/components/admin/admin-debug"
import AuthDebug from "@/components/admin/auth-debug"

export default function AdminPage() {
  const [authState, setAuthState] = useState<{
    isLoading: boolean
    isAuthenticated: boolean
    isAdmin: boolean
    user: any
    error?: string
  }>({
    isLoading: true,
    isAuthenticated: false,
    isAdmin: false,
    user: null,
  })

  const [showDebug, setShowDebug] = useState(false)
  const supabase = createClientComponentClient()

  const checkAuth = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }))

      // 1. 세션 확인
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("Session check:", session, sessionError)

      if (sessionError) {
        console.error("Session error:", sessionError)
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: undefined,
        })
        return
      }

      if (!session || !session.user) {
        console.log("No session or user found")
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
        })
        return
      }

      const user = session.user
      console.log("User from session:", user)

      // 2. 사용자 역할 확인 - 먼저 ID로, 실패하면 이메일로
      let userData = null
      let dbError = null

      // ID로 검색 시도
      const { data: userByIdData, error: userByIdError } = await supabase
        .from("users")
        .select("role, email, name, is_active")
        .eq("id", user.id)
        .single()

      if (userByIdError) {
        console.log("User not found by ID, trying email:", user.email)

        // 이메일로 검색 시도
        const { data: userByEmailData, error: userByEmailError } = await supabase
          .from("users")
          .select("role, email, name, is_active")
          .eq("email", user.email)
          .single()

        userData = userByEmailData
        dbError = userByEmailError
      } else {
        userData = userByIdData
        dbError = userByIdError
      }

      console.log("User data from DB:", userData, dbError)

      if (dbError) {
        console.error("Database error:", dbError)
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isAdmin: false,
          user: user,
          error: `데이터베이스 오류: ${dbError.message}`,
        })
        return
      }

      const isAdmin = userData?.role === "admin"
      console.log("Is admin:", isAdmin, "Role:", userData?.role)

      setAuthState({
        isLoading: false,
        isAuthenticated: true,
        isAdmin,
        user: { ...user, ...userData },
      })
    } catch (error) {
      console.error("Auth check error:", error)
      setAuthState({
        isLoading: false,
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: error instanceof Error ? error.message : "인증 확인 중 오류가 발생했습니다.",
      })
    }
  }

  useEffect(() => {
    checkAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setTimeout(() => {
        checkAuth()
      }, 100)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 로딩 중
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>인증 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  // 로그인이 안 되어 있는 경우
  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {authState.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
              <p className="font-semibold">오류 발생</p>
              <p className="text-sm mt-1">{authState.error}</p>
            </div>
          )}
          <AdminLoginForm onLoginSuccess={checkAuth} />

          <button
            onClick={() => setShowDebug(!showDebug)}
            className="mt-4 text-xs text-gray-500 underline w-full text-center"
          >
            디버그 정보 {showDebug ? "숨기기" : "보기"}
          </button>
          {showDebug && <AdminDebug />}
        </div>
      </div>
    )
  }

  // 관리자 권한이 없는 경우
  if (!authState.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 text-center">
            <p className="font-semibold">관리자 권한이 필요합니다</p>
            <p className="text-sm mt-1">현재 역할: {authState.user?.role || "없음"}</p>
            <p className="text-sm">이메일: {authState.user?.email}</p>
            {authState.error && <p className="text-sm mt-2 text-red-600">오류: {authState.error}</p>}
          </div>

          {/* Auth ID 매핑 디버그 */}
          <AuthDebug />

          <div className="mt-4 space-y-2">
            <button
              onClick={async () => {
                console.log("Signing out...")
                await supabase.auth.signOut()
                setTimeout(checkAuth, 100)
              }}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              로그아웃 후 다시 로그인
            </button>

            <button onClick={() => setShowDebug(!showDebug)} className="w-full text-xs text-gray-500 underline">
              상세 디버그 정보 {showDebug ? "숨기기" : "보기"}
            </button>
          </div>

          {showDebug && <AdminDebug />}
        </div>
      </div>
    )
  }

  // 관리자 권한이 있는 경우
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDashboard />

      <button
        onClick={() => setShowDebug(!showDebug)}
        className="fixed bottom-4 right-4 bg-black text-white px-3 py-1 rounded text-xs hover:bg-gray-800"
      >
        Debug
      </button>
      {showDebug && (
        <div className="fixed bottom-12 right-4 w-96 max-h-96 overflow-auto z-50">
          <AdminDebug />
        </div>
      )}
    </div>
  )
}
