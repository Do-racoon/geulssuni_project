"use client"

import { useEffect, useState } from "react"

export default function EnvironmentCheckPage() {
  const [envVars, setEnvVars] = useState({
    supabaseUrl: "",
    supabaseAnonKey: "",
    hasServiceRoleKey: false,
    serviceRoleKeyHint: "",
  })
  const [connectionTest, setConnectionTest] = useState({
    status: "pending",
    message: "테스트 대기 중...",
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function checkEnvironmentVariables() {
      try {
        setLoading(true)
        // 서버 API를 통해 환경변수 확인
        const response = await fetch("/api/check-env")

        if (!response.ok) {
          throw new Error("환경변수 확인 API 호출 실패")
        }

        const data = await response.json()

        setEnvVars({
          supabaseUrl: data.supabaseUrl,
          supabaseAnonKey: data.supabaseAnonKey,
          hasServiceRoleKey: data.hasServiceRoleKey,
          serviceRoleKeyHint: data.serviceRoleKeyHint,
        })

        // 연결 테스트
        if (data.supabaseUrl && data.supabaseAnonKey) {
          testConnection(data.supabaseUrl)
        }
      } catch (err) {
        console.error("Error checking environment variables:", err)
        setError(err.message || "환경변수 확인 중 오류가 발생했습니다.")
      } finally {
        setLoading(false)
      }
    }

    checkEnvironmentVariables()
  }, [])

  const testConnection = async (url) => {
    try {
      setConnectionTest({
        status: "testing",
        message: "Supabase 연결 테스트 중...",
      })

      // 서버 측에서 연결 테스트
      const response = await fetch("/api/test-connection")

      if (!response.ok) {
        throw new Error("연결 테스트 API 호출 실패")
      }

      const data = await response.json()

      if (data.success) {
        setConnectionTest({
          status: "success",
          message: "Supabase 연결 성공!",
        })
      } else {
        setConnectionTest({
          status: "error",
          message: `연결 실패: ${data.error}`,
        })
      }
    } catch (err) {
      console.error("Connection test error:", err)
      setConnectionTest({
        status: "error",
        message: `연결 테스트 오류: ${err.message}`,
      })
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">환경변수 확인</h1>

      {loading ? (
        <div className="p-4 bg-blue-50 rounded">
          <p className="text-blue-600">환경변수 확인 중...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 rounded">
          <p className="text-red-600">{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4">Supabase 환경변수</h2>
            <table className="w-full">
              <tbody>
                <tr className="border-b">
                  <td className="py-2 font-medium">NEXT_PUBLIC_SUPABASE_URL</td>
                  <td className="py-2">
                    {envVars.supabaseUrl ? (
                      <span className="text-green-600">✅ 설정됨: {envVars.supabaseUrl}</span>
                    ) : (
                      <span className="text-red-600">❌ 설정되지 않음</span>
                    )}
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</td>
                  <td className="py-2">
                    {envVars.supabaseAnonKey ? (
                      <span className="text-green-600">✅ 설정됨: {envVars.supabaseAnonKey}</span>
                    ) : (
                      <span className="text-red-600">❌ 설정되지 않음</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-2 font-medium">SUPABASE_SERVICE_ROLE_KEY</td>
                  <td className="py-2">
                    {envVars.hasServiceRoleKey ? (
                      <span className="text-green-600">✅ 설정됨: {envVars.serviceRoleKeyHint}</span>
                    ) : (
                      <span className="text-red-600">❌ 설정되지 않음</span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-4">Supabase 연결 테스트</h2>
            <div
              className={`p-3 rounded ${
                connectionTest.status === "success"
                  ? "bg-green-100 text-green-700"
                  : connectionTest.status === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
              }`}
            >
              {connectionTest.message}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <h2 className="text-xl font-semibold mb-2">문제 해결 방법</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Vercel 프로젝트 설정에서 환경변수가 올바르게 설정되었는지 확인하세요.</li>
              <li>
                Supabase 프로젝트 설정에서 올바른 URL과 API 키를 복사했는지 확인하세요.
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>URL: Supabase 프로젝트 설정 → API → URL</li>
                  <li>Anon Key: Supabase 프로젝트 설정 → API → anon/public</li>
                  <li>Service Role Key: Supabase 프로젝트 설정 → API → service_role</li>
                </ul>
              </li>
              <li>환경변수를 업데이트한 후 애플리케이션을 다시 배포하세요.</li>
              <li>로컬에서 개발 중이라면 .env.local 파일에 환경변수를 추가하고 서버를 다시 시작하세요.</li>
            </ol>
          </div>

          <div className="p-4 bg-blue-50 rounded">
            <h2 className="text-xl font-semibold mb-2">다음 단계</h2>
            <div className="space-y-2">
              <a href="/auth-debug" className="block text-blue-600 hover:underline">
                → 인증 디버그 페이지로 이동
              </a>
              <a href="/simple-login" className="block text-blue-600 hover:underline">
                → 간단한 로그인 페이지로 이동
              </a>
              <a href="/supabase-test" className="block text-blue-600 hover:underline">
                → Supabase 연결 테스트 페이지로 이동
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
