"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log("🔍 Starting auth debug check...")

        // 1. 세션 확인
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        console.log("Session:", session)
        console.log("Session Error:", sessionError)

        let userFromDB = null
        let userError = null

        if (session?.user) {
          // 2. 사용자 정보 확인 (ID로)
          const { data: userById, error: userByIdError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()

          console.log("User by ID:", userById)
          console.log("User by ID Error:", userByIdError)

          if (userByIdError) {
            // 3. 이메일로 사용자 확인
            const { data: userByEmail, error: userByEmailError } = await supabase
              .from("users")
              .select("*")
              .eq("email", session.user.email)
              .single()

            console.log("User by Email:", userByEmail)
            console.log("User by Email Error:", userByEmailError)

            userFromDB = userByEmail
            userError = userByEmailError
          } else {
            userFromDB = userById
            userError = userByIdError
          }
        }

        // 4. 환경 변수 확인
        const envCheck = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }

        setDebugInfo({
          session: {
            exists: !!session,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            error: sessionError?.message,
          },
          userFromDB: {
            exists: !!userFromDB,
            id: userFromDB?.id,
            email: userFromDB?.email,
            role: userFromDB?.role,
            isActive: userFromDB?.is_active,
            createdAt: userFromDB?.created_at,
            error: userError?.message,
          },
          environment: envCheck,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Debug error:", error)
        setDebugInfo({
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p>인증 상태 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">인증 디버그 정보</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">세션 정보</h2>
          <div className="space-y-2">
            <p>
              <strong>세션 존재:</strong>{" "}
              <span className={debugInfo?.session?.exists ? "text-green-600" : "text-red-600"}>
                {debugInfo?.session?.exists ? "✅ 있음" : "❌ 없음"}
              </span>
            </p>
            <p>
              <strong>사용자 ID:</strong> {debugInfo?.session?.userId || "없음"}
            </p>
            <p>
              <strong>이메일:</strong> {debugInfo?.session?.userEmail || "없음"}
            </p>
            {debugInfo?.session?.error && (
              <p>
                <strong>오류:</strong> <span className="text-red-600">{debugInfo.session.error}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">데이터베이스 사용자 정보</h2>
          <div className="space-y-2">
            <p>
              <strong>DB에서 사용자 발견:</strong>{" "}
              <span className={debugInfo?.userFromDB?.exists ? "text-green-600" : "text-red-600"}>
                {debugInfo?.userFromDB?.exists ? "✅ 있음" : "❌ 없음"}
              </span>
            </p>
            <p>
              <strong>역할:</strong>{" "}
              <span className={debugInfo?.userFromDB?.role === "admin" ? "text-green-600" : "text-orange-600"}>
                {debugInfo?.userFromDB?.role || "없음"}
              </span>
            </p>
            <p>
              <strong>활성 상태:</strong>{" "}
              <span className={debugInfo?.userFromDB?.isActive ? "text-green-600" : "text-red-600"}>
                {debugInfo?.userFromDB?.isActive ? "✅ 활성" : "❌ 비활성"}
              </span>
            </p>
            <p>
              <strong>생성일:</strong> {debugInfo?.userFromDB?.createdAt || "없음"}
            </p>
            {debugInfo?.userFromDB?.error && (
              <p>
                <strong>오류:</strong> <span className="text-red-600">{debugInfo.userFromDB.error}</span>
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">환경 변수</h2>
          <div className="space-y-2">
            <p>
              <strong>Supabase URL:</strong>{" "}
              <span className={debugInfo?.environment?.hasSupabaseUrl ? "text-green-600" : "text-red-600"}>
                {debugInfo?.environment?.hasSupabaseUrl ? "✅ 설정됨" : "❌ 없음"}
              </span>
            </p>
            <p>
              <strong>Supabase Anon Key:</strong>{" "}
              <span className={debugInfo?.environment?.hasSupabaseAnonKey ? "text-green-600" : "text-red-600"}>
                {debugInfo?.environment?.hasSupabaseAnonKey ? "✅ 설정됨" : "❌ 없음"}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold mb-2">전체 디버그 정보 (JSON)</h3>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            새로고침
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              window.location.reload()
            }}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 ml-4"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}
