"use client"

import { useEffect, useState } from "react"

interface EnvStatus {
  hasUrl: boolean
  hasServiceKey: boolean
  isReady: boolean
  url: string
  serviceKey: string
}

export default function EnvDebugPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/check-admin-env")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setEnvStatus(data)
        }
      })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">환경 변수 확인 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">오류 발생</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">환경 변수 디버그</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Supabase 환경 변수 상태</h2>

          {envStatus && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">NEXT_PUBLIC_SUPABASE_URL</span>
                <span className={envStatus.hasUrl ? "text-green-600" : "text-red-600"}>{envStatus.url}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">SUPABASE_SERVICE_ROLE_KEY</span>
                <span className={envStatus.hasServiceKey ? "text-green-600" : "text-red-600"}>
                  {envStatus.serviceKey}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium">전체 상태</span>
                <span className={envStatus.isReady ? "text-green-600" : "text-red-600"}>
                  {envStatus.isReady ? "✅ 준비됨" : "❌ 설정 필요"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">해결 방법</h2>

          {envStatus && !envStatus.isReady && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                <h3 className="font-medium text-yellow-800 mb-2">환경 변수 설정이 필요합니다</h3>
                <ol className="list-decimal list-inside space-y-2 text-yellow-700">
                  <li>Supabase 대시보드에 로그인</li>
                  <li>프로젝트 설정 → API 탭으로 이동</li>
                  <li>Service Role Key를 복사</li>
                  <li>환경 변수에 SUPABASE_SERVICE_ROLE_KEY 추가</li>
                </ol>
              </div>
            </div>
          )}

          {envStatus && envStatus.isReady && (
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-medium text-green-800 mb-2">모든 환경 변수가 올바르게 설정되었습니다!</h3>
              <p className="text-green-700">이제 모든 기능이 정상적으로 작동할 것입니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
