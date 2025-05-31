"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkEverything = async () => {
      const info: any = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        url: window.location.href,
      }

      try {
        // 1. 세션 확인
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        info.session = {
          exists: !!sessionData.session,
          user_id: sessionData.session?.user?.id,
          user_email: sessionData.session?.user?.email,
          error: sessionError?.message,
        }

        // 2. 사용자 정보 확인
        if (sessionData.session?.user) {
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, email, role, name, is_active")
            .eq("id", sessionData.session.user.id)
            .single()

          info.userById = {
            found: !!userData,
            data: userData,
            error: userError?.message,
          }

          // 이메일로도 검색해보기
          const { data: userByEmail, error: emailError } = await supabase
            .from("users")
            .select("id, email, role, name, is_active")
            .eq("email", sessionData.session.user.email)
            .single()

          info.userByEmail = {
            found: !!userByEmail,
            data: userByEmail,
            error: emailError?.message,
          }
        }

        // 3. 환경 변수 확인
        info.envVars = {
          supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          supabase_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        }

        // 4. API 라우트 테스트
        try {
          const response = await fetch("/api/auth-status")
          const apiData = await response.json()
          info.apiTest = {
            status: response.status,
            data: apiData,
          }
        } catch (apiError) {
          info.apiTest = {
            error: apiError instanceof Error ? apiError.message : "Unknown API error",
          }
        }

        // 5. 모든 admin 사용자 조회
        const { data: allAdmins, error: adminError } = await supabase
          .from("users")
          .select("id, email, role, name")
          .eq("role", "admin")

        info.allAdmins = {
          count: allAdmins?.length || 0,
          users: allAdmins,
          error: adminError?.message,
        }
      } catch (error) {
        info.globalError = error instanceof Error ? error.message : "Unknown error"
      }

      setDebugInfo(info)
      setLoading(false)
    }

    checkEverything()
  }, [])

  if (loading) {
    return <div className="p-8">디버깅 정보 수집 중...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin 접근 문제 디버깅</h1>

      <div className="space-y-6">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">기본 정보</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(
              {
                timestamp: debugInfo.timestamp,
                environment: debugInfo.environment,
                url: debugInfo.url,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div className="bg-blue-50 p-4 rounded">
          <h2 className="font-bold mb-2">세션 정보</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.session, null, 2)}</pre>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h2 className="font-bold mb-2">사용자 정보 (ID로 검색)</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.userById, null, 2)}</pre>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h2 className="font-bold mb-2">사용자 정보 (이메일로 검색)</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.userByEmail, null, 2)}</pre>
        </div>

        <div className="bg-purple-50 p-4 rounded">
          <h2 className="font-bold mb-2">환경 변수</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.envVars, null, 2)}</pre>
        </div>

        <div className="bg-orange-50 p-4 rounded">
          <h2 className="font-bold mb-2">API 테스트</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.apiTest, null, 2)}</pre>
        </div>

        <div className="bg-red-50 p-4 rounded">
          <h2 className="font-bold mb-2">모든 Admin 사용자</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(debugInfo.allAdmins, null, 2)}</pre>
        </div>

        {debugInfo.globalError && (
          <div className="bg-red-100 border border-red-400 p-4 rounded">
            <h2 className="font-bold mb-2 text-red-800">전역 오류</h2>
            <p className="text-red-700">{debugInfo.globalError}</p>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-xl font-bold">문제 해결 단계</h2>
        <div className="space-y-2 text-sm">
          <p>1. 세션이 존재하는지 확인</p>
          <p>2. 사용자가 데이터베이스에 존재하는지 확인</p>
          <p>3. 사용자의 role이 'admin'인지 확인</p>
          <p>4. 환경 변수가 올바르게 설정되어 있는지 확인</p>
          <p>5. API 라우트가 정상 작동하는지 확인</p>
        </div>
      </div>

      <div className="mt-6 space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          새로고침
        </button>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Admin 페이지로 이동
        </button>
        <button
          onClick={() => (window.location.href = "/admin/login")}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
        >
          Admin 로그인 페이지로 이동
        </button>
      </div>
    </div>
  )
}
