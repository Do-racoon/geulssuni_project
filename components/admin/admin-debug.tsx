"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AdminDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchDebugInfo = async () => {
      try {
        setIsLoading(true)

        // 1. 세션 정보
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

        // 2. 사용자 정보 (세션이 있는 경우에만)
        let userData = null
        let userError = null
        if (sessionData?.session?.user) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", sessionData.session.user.id)
            .single()
          userData = data
          userError = error
        }

        // 3. 환경 변수 확인
        const envInfo = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ 설정됨" : "❌ 없음",
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ 설정됨" : "❌ 없음",
        }

        setDebugInfo({
          session: {
            data: sessionData,
            error: sessionError,
          },
          user: {
            data: userData,
            error: userError,
          },
          environment: envInfo,
          timestamp: new Date().toISOString(),
        })
      } catch (error) {
        console.error("Debug info fetch error:", error)
        setDebugInfo({
          error: error instanceof Error ? error.message : "디버그 정보 로드 실패",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDebugInfo()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-black text-white p-4 rounded text-xs font-mono">
        <p>디버그 정보 로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="bg-black text-white p-4 rounded text-xs font-mono max-h-96 overflow-auto">
      <h3 className="text-yellow-400 font-bold mb-2">🔍 Admin Debug Info</h3>

      <div className="space-y-3">
        {/* 세션 정보 */}
        <div>
          <h4 className="text-green-400 font-semibold">📱 Session:</h4>
          {debugInfo?.session?.error ? (
            <p className="text-red-400">❌ Error: {debugInfo.session.error.message}</p>
          ) : debugInfo?.session?.data?.session ? (
            <div className="ml-2">
              <p>✅ User ID: {debugInfo.session.data.session.user.id}</p>
              <p>✅ Email: {debugInfo.session.data.session.user.email}</p>
              <p>✅ Expires: {new Date(debugInfo.session.data.session.expires_at * 1000).toLocaleString()}</p>
            </div>
          ) : (
            <p className="text-red-400">❌ No session</p>
          )}
        </div>

        {/* 사용자 DB 정보 */}
        <div>
          <h4 className="text-green-400 font-semibold">🗄️ Database User:</h4>
          {debugInfo?.user?.error ? (
            <p className="text-red-400">❌ Error: {debugInfo.user.error.message}</p>
          ) : debugInfo?.user?.data ? (
            <div className="ml-2">
              <p>
                ✅ Role: <span className="text-yellow-300">{debugInfo.user.data.role}</span>
              </p>
              <p>✅ Name: {debugInfo.user.data.name}</p>
              <p>✅ Active: {debugInfo.user.data.is_active ? "Yes" : "No"}</p>
              <p>✅ Email Verified: {debugInfo.user.data.email_verified ? "Yes" : "No"}</p>
            </div>
          ) : (
            <p className="text-red-400">❌ No user data</p>
          )}
        </div>

        {/* 환경 변수 */}
        <div>
          <h4 className="text-green-400 font-semibold">🌍 Environment:</h4>
          <div className="ml-2">
            <p>Supabase URL: {debugInfo?.environment?.supabaseUrl}</p>
            <p>Anon Key: {debugInfo?.environment?.supabaseAnonKey}</p>
          </div>
        </div>

        {/* 권한 체크 */}
        <div>
          <h4 className="text-green-400 font-semibold">🔐 Admin Check:</h4>
          <div className="ml-2">
            {debugInfo?.user?.data?.role === "admin" ? (
              <p className="text-green-400">✅ Admin access granted</p>
            ) : (
              <p className="text-red-400">❌ Admin access denied (role: {debugInfo?.user?.data?.role || "none"})</p>
            )}
          </div>
        </div>

        {/* 타임스탬프 */}
        <div className="text-gray-400 text-xs border-t border-gray-600 pt-2">Updated: {debugInfo?.timestamp}</div>
      </div>
    </div>
  )
}
