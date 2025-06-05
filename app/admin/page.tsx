"use client"

import { useState, useEffect, useRef } from "react"
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
  const checkingRef = useRef(false)
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)

  const checkAuth = async () => {
    // 중복 실행 방지
    if (checkingRef.current) {
      console.log("🔄 Auth check already in progress, skipping")
      return
    }

    // 최대 재시도 횟수 제한
    if (retryCountRef.current > 5) {
      console.log("🚫 Max retry attempts reached")
      if (mountedRef.current) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: "인증 확인 중 오류가 발생했습니다. 페이지를 새로고침해주세요.",
        })
      }
      return
    }

    checkingRef.current = true
    retryCountRef.current++

    try {
      console.log(`🔍 Starting auth check (attempt ${retryCountRef.current})...`)
      setAuthState((prev) => ({ ...prev, isLoading: true, error: undefined }))

      // 1. 세션 확인 with timeout
      const sessionPromise = supabase.auth.getSession()
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Session check timeout")), 10000),
      )

      const {
        data: { session },
        error: sessionError,
      } = (await Promise.race([sessionPromise, timeoutPromise])) as any

      console.log("Session check result:", {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError?.message,
        attempt: retryCountRef.current,
      })

      if (sessionError) {
        console.error("Session error:", sessionError)
        throw new Error(`세션 오류: ${sessionError.message}`)
      }

      if (!session || !session.user) {
        console.log("No session or user found")
        if (mountedRef.current) {
          setAuthState({
            isLoading: false,
            isAuthenticated: false,
            isAdmin: false,
            user: null,
          })
        }
        return
      }

      const user = session.user
      console.log("User from session:", user.id, user.email)

      // 2. 사용자 역할 확인 with timeout and retry
      let userData = null
      let dbError = null

      try {
        // ID로 검색 시도
        const userByIdPromise = supabase.from("users").select("role, email, name, is_active").eq("id", user.id).single()

        const { data: userByIdData, error: userByIdError } = (await Promise.race([
          userByIdPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("User query timeout")), 8000)),
        ])) as any

        if (userByIdError) {
          console.log("User not found by ID, trying email:", user.email)

          // 이메일로 검색 시도
          const userByEmailPromise = supabase
            .from("users")
            .select("role, email, name, is_active")
            .eq("email", user.email)
            .single()

          const { data: userByEmailData, error: userByEmailError } = (await Promise.race([
            userByEmailPromise,
            new Promise((_, reject) => setTimeout(() => reject(new Error("Email query timeout")), 8000)),
          ])) as any

          userData = userByEmailData
          dbError = userByEmailError
        } else {
          userData = userByIdData
          dbError = userByIdError
        }
      } catch (queryError) {
        console.error("Database query error:", queryError)
        dbError = queryError
      }

      console.log("User data from DB:", userData, dbError)

      if (dbError) {
        console.error("Database error:", dbError)
        throw new Error(`데이터베이스 오류: ${dbError.message}`)
      }

      const isAdmin = userData?.role === "admin"
      console.log("Is admin:", isAdmin, "Role:", userData?.role)

      if (mountedRef.current) {
        setAuthState({
          isLoading: false,
          isAuthenticated: true,
          isAdmin,
          user: { ...user, ...userData },
        })
      }

      // 성공 시 재시도 카운터 리셋
      retryCountRef.current = 0
    } catch (error) {
      console.error("Auth check error:", error)

      if (mountedRef.current) {
        setAuthState({
          isLoading: false,
          isAuthenticated: false,
          isAdmin: false,
          user: null,
          error: error instanceof Error ? error.message : "인증 확인 중 오류가 발생했습니다.",
        })
      }

      // 네트워크 오류인 경우 재시도
      if (retryCountRef.current <= 3 && error instanceof Error && error.message.includes("timeout")) {
        console.log(`🔄 Retrying auth check in 2 seconds (attempt ${retryCountRef.current + 1})...`)
        setTimeout(() => {
          if (mountedRef.current && !checkingRef.current) {
            checkAuth()
          }
        }, 2000)
      }
    } finally {
      checkingRef.current = false
    }
  }

  useEffect(() => {
    mountedRef.current = true
    retryCountRef.current = 0

    // 초기 인증 체크
    checkAuth()

    // 인증 상태 변경 리스너
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)

      // 상태 변경 시 약간의 지연 후 체크 (중복 실행 방지)
      setTimeout(() => {
        if (mountedRef.current && !checkingRef.current) {
          retryCountRef.current = 0 // 상태 변경 시 재시도 카운터 리셋
          checkAuth()
        }
      }, 1000)
    })

    // 컴포넌트 언마운트 시 정리
    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [])

  // 로딩 중
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>인증 상태 확인 중...</p>
          {retryCountRef.current > 1 && (
            <p className="text-sm text-gray-500 mt-2">재시도 중... ({retryCountRef.current}/5)</p>
          )}
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
              <button
                onClick={() => {
                  retryCountRef.current = 0
                  checkAuth()
                }}
                className="mt-2 text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                다시 시도
              </button>
            </div>
          )}
          <AdminLoginForm
            onLoginSuccess={() => {
              retryCountRef.current = 0
              if (!checkingRef.current) {
                setTimeout(checkAuth, 1000)
              }
            }}
          />

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
                // 로그아웃 후 페이지 새로고침
                setTimeout(() => {
                  window.location.href = "/admin/login"
                }, 1000)
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
