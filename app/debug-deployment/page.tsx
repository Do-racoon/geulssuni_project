"use client"

import { useEffect, useState } from "react"

export default function DeploymentDebugPage() {
  const [clientEnv, setClientEnv] = useState({})
  const [serverEnv, setServerEnv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // 클라이언트 측 환경변수 확인
    const clientVars = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      nodeEnv: process.env.NODE_ENV,
      // 현재 URL 정보
      currentUrl: typeof window !== "undefined" ? window.location.origin : "unknown",
      // 다른 NEXT_PUBLIC_ 변수들도 확인
      allEnvKeys: Object.keys(process.env).filter((key) => key.startsWith("NEXT_PUBLIC_")),
    }

    setClientEnv(clientVars)

    // 서버 측 환경변수 확인
    checkServerEnv()
  }, [])

  const checkServerEnv = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/debug-env")

      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setServerEnv(data)
    } catch (err) {
      console.error("서버 환경변수 확인 오류:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testSupabaseConnection = async () => {
    try {
      const response = await fetch("/api/simple-test")
      const data = await response.json()
      alert(data.success ? "Supabase 연결 성공!" : `연결 실패: ${data.error}`)
    } catch (err) {
      alert(`테스트 실패: ${err.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">배포 환경 디버깅</h1>

      <div className="space-y-6">
        {/* 현재 환경 정보 */}
        <div className="p-4 bg-purple-50 rounded border">
          <h2 className="text-xl font-semibold mb-4">현재 환경 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>현재 URL:</strong>
              <div className="p-2 bg-gray-100 rounded">{clientEnv.currentUrl}</div>
            </div>
            <div>
              <strong>NODE_ENV:</strong>
              <div className="p-2 bg-gray-100 rounded">{clientEnv.nodeEnv || "설정되지 않음"}</div>
            </div>
          </div>
        </div>

        {/* 클라이언트 측 환경변수 */}
        <div className="p-4 bg-blue-50 rounded border">
          <h2 className="text-xl font-semibold mb-4">클라이언트 측 환경변수 (NEXT_PUBLIC_)</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong>
                <div
                  className={`p-2 rounded ${clientEnv.supabaseUrl ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {clientEnv.supabaseUrl || "❌ 설정되지 않음"}
                </div>
              </div>
              <div>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong>
                <div
                  className={`p-2 rounded ${clientEnv.supabaseAnonKey ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {clientEnv.supabaseAnonKey
                    ? `✅ 설정됨 (${clientEnv.supabaseAnonKey.substring(0, 10)}...)`
                    : "❌ 설정되지 않음"}
                </div>
              </div>
              <div>
                <strong>NEXT_PUBLIC_APP_URL:</strong>
                <div
                  className={`p-2 rounded ${clientEnv.appUrl ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {clientEnv.appUrl || "⚠️ 설정되지 않음 (자동 감지됨)"}
                </div>
              </div>
            </div>
            <div>
              <strong>감지된 NEXT_PUBLIC_ 환경변수들:</strong>
              <div className="bg-gray-100 p-2 rounded">
                {clientEnv.allEnvKeys?.length > 0 ? clientEnv.allEnvKeys.join(", ") : "없음"}
              </div>
            </div>
          </div>
        </div>

        {/* 서버 측 환경변수 */}
        <div className="p-4 bg-green-50 rounded border">
          <h2 className="text-xl font-semibold mb-4">서버 측 환경변수</h2>
          {loading ? (
            <div className="text-blue-600">서버 환경변수 확인 중...</div>
          ) : error ? (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              <strong>오류:</strong> {error}
              <div className="mt-2">
                <button
                  onClick={checkServerEnv}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  다시 시도
                </button>
              </div>
            </div>
          ) : serverEnv ? (
            <div className="space-y-2">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_URL (서버):</strong>
                  <div
                    className={`p-2 rounded ${serverEnv.supabaseUrl ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {serverEnv.supabaseUrl || "❌ 설정되지 않음"}
                  </div>
                </div>
                <div>
                  <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY (서버):</strong>
                  <div
                    className={`p-2 rounded ${serverEnv.hasAnonKey ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {serverEnv.hasAnonKey ? `✅ 설정됨 (${serverEnv.anonKeyHint})` : "❌ 설정되지 않음"}
                  </div>
                </div>
                <div>
                  <strong>SUPABASE_SERVICE_ROLE_KEY:</strong>
                  <div
                    className={`p-2 rounded ${serverEnv.hasServiceKey ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                  >
                    {serverEnv.hasServiceKey ? `✅ 설정됨 (${serverEnv.serviceKeyHint})` : "❌ 설정되지 않음"}
                  </div>
                </div>
                <div>
                  <strong>VERCEL_URL:</strong>
                  <div
                    className={`p-2 rounded ${serverEnv.vercelUrl !== "not-set" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                  >
                    {serverEnv.vercelUrl !== "not-set" ? serverEnv.vercelUrl : "⚠️ 설정되지 않음 (Vercel 자동 설정)"}
                  </div>
                </div>
                <div>
                  <strong>VERCEL_ENV:</strong>
                  <div className="p-2 bg-gray-100 rounded">{serverEnv.vercelEnv || "로컬 환경"}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <strong>서버에서 감지된 환경변수 개수:</strong> {serverEnv.totalEnvCount}
                </div>
                <div>
                  <strong>NEXT_PUBLIC_ 환경변수 개수:</strong> {serverEnv.publicEnvCount}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-600">서버 환경변수 정보를 가져올 수 없습니다.</div>
          )}
        </div>

        {/* 문제 진단 및 해결 방법 */}
        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4">문제 진단 및 해결 방법</h2>

          {/* VERCEL_URL 관련 안내 */}
          <div className="mb-4 p-3 bg-blue-100 rounded">
            <h3 className="font-semibold text-blue-800">VERCEL_URL에 대한 안내</h3>
            <p className="text-blue-700 mt-1">
              VERCEL_URL은 Vercel에서 자동으로 설정되는 환경변수입니다. 로컬 개발 환경에서는 없어도 정상이며, 배포
              시에는 자동으로 설정됩니다.
            </p>
          </div>

          <div className="space-y-2">
            {!clientEnv.supabaseUrl && (
              <div className="p-2 bg-red-100 text-red-800 rounded">
                ❌ 클라이언트에서 NEXT_PUBLIC_SUPABASE_URL을 찾을 수 없습니다.
                <div className="text-sm mt-1">→ Vercel 환경변수에 NEXT_PUBLIC_SUPABASE_URL을 추가하세요.</div>
              </div>
            )}
            {!clientEnv.supabaseAnonKey && (
              <div className="p-2 bg-red-100 text-red-800 rounded">
                ❌ 클라이언트에서 NEXT_PUBLIC_SUPABASE_ANON_KEY를 찾을 수 없습니다.
                <div className="text-sm mt-1">→ Vercel 환경변수에 NEXT_PUBLIC_SUPABASE_ANON_KEY를 추가하세요.</div>
              </div>
            )}
            {serverEnv && !serverEnv.hasServiceKey && (
              <div className="p-2 bg-red-100 text-red-800 rounded">
                ❌ 서버에서 SUPABASE_SERVICE_ROLE_KEY를 찾을 수 없습니다.
                <div className="text-sm mt-1">→ Vercel 환경변수에 SUPABASE_SERVICE_ROLE_KEY를 추가하세요.</div>
              </div>
            )}
            {clientEnv.supabaseUrl && clientEnv.supabaseAnonKey && serverEnv?.hasServiceKey && (
              <div className="p-2 bg-green-100 text-green-800 rounded">✅ 모든 필수 환경변수가 설정되어 있습니다.</div>
            )}
          </div>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">단계별 해결 방법:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</li>
              <li>
                다음 환경변수들을 추가:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>NEXT_PUBLIC_SUPABASE_URL</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  <li>SUPABASE_SERVICE_ROLE_KEY</li>
                </ul>
              </li>
              <li>모든 환경 (Production, Preview, Development)에 체크</li>
              <li>환경변수 저장 후 다시 배포</li>
            </ol>
          </div>
        </div>

        {/* 테스트 버튼들 */}
        <div className="p-4 bg-gray-50 rounded">
          <h2 className="text-xl font-semibold mb-4">테스트</h2>
          <div className="space-x-2">
            <button onClick={checkServerEnv} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              서버 환경변수 다시 확인
            </button>
            <button
              onClick={testSupabaseConnection}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Supabase 연결 테스트
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              페이지 새로고침
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
