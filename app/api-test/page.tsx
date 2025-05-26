"use client"

import { useState } from "react"

export default function ApiTestPage() {
  const [envResult, setEnvResult] = useState(null)
  const [connectionResult, setConnectionResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const testEnvApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/check-env")
      const data = await response.json()
      setEnvResult({ success: response.ok, data })
    } catch (error) {
      setEnvResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const testConnectionApi = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/test-connection")
      const data = await response.json()
      setConnectionResult({ success: response.ok, data })
    } catch (error) {
      setConnectionResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">API 테스트</h1>

      <div className="space-y-6">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-4">환경변수 확인 API</h2>
          <button
            onClick={testEnvApi}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "환경변수 API 테스트"}
          </button>

          {envResult && (
            <div className="mt-4">
              <h3 className="font-semibold">결과:</h3>
              <pre className="bg-gray-800 text-white p-3 rounded mt-2 overflow-auto">
                {JSON.stringify(envResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-4">연결 테스트 API</h2>
          <button
            onClick={testConnectionApi}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "테스트 중..." : "연결 테스트 API 테스트"}
          </button>

          {connectionResult && (
            <div className="mt-4">
              <h3 className="font-semibold">결과:</h3>
              <pre className="bg-gray-800 text-white p-3 rounded mt-2 overflow-auto">
                {JSON.stringify(connectionResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <h2 className="text-xl font-semibold mb-2">디버깅 팁</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>브라우저의 개발자 도구 콘솔을 확인하세요</li>
            <li>Vercel 배포 로그를 확인하세요</li>
            <li>환경변수가 올바르게 설정되었는지 확인하세요</li>
            <li>Supabase 프로젝트가 활성화되어 있는지 확인하세요</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
