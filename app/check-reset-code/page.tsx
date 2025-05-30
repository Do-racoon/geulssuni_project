"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"

export default function CheckResetCodePage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [codeInfo, setCodeInfo] = useState<{ code: string; expires_at: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/get-reset-code?email=${encodeURIComponent(email)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "인증번호 조회에 실패했습니다.")
      }

      setCodeInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증번호 조회에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">인증번호 확인</h2>
          <p className="mt-2 text-center text-sm text-gray-600">이메일로 발송된 인증번호를 확인하세요</p>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          {error && <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm">{error}</div>}

          {codeInfo ? (
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 p-6 mb-6">
                <h3 className="text-lg font-medium text-green-800 mb-2">인증번호</h3>
                <div className="text-3xl font-bold text-green-600 mb-2">{codeInfo.code}</div>
                <p className="text-sm text-green-700">
                  만료 시간: {new Date(codeInfo.expires_at).toLocaleString("ko-KR")}
                </p>
              </div>
              <Link
                href={`/login-edit?code=${codeInfo.code}&email=${encodeURIComponent(email)}`}
                className="block w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors text-center mb-4"
              >
                비밀번호 변경하기
              </Link>
              <button
                onClick={() => {
                  setCodeInfo(null)
                  setEmail("")
                }}
                className="text-sm text-gray-700 hover:underline"
              >
                다른 이메일 확인
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="인증번호를 확인할 이메일을 입력하세요"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400"
              >
                {isLoading ? "확인 중..." : "인증번호 확인"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link href="/forgot-password" className="text-sm text-gray-700 hover:underline">
              인증번호 재발송
            </Link>
            {" | "}
            <Link href="/login" className="text-sm text-gray-700 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
