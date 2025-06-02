"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Copy, Check } from "lucide-react"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [resetCode, setResetCode] = useState("")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/send-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `서버 오류 (${response.status})`)
      }

      setSuccess(true)
      setResetCode(data.code)
    } catch (err) {
      console.error("Reset code error:", err)
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("인증번호 생성에 실패했습니다. 잠시 후 다시 시도해주세요.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(resetCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Copy failed:", err)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-8">
      {error && <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm">{error}</div>}

      {success ? (
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>

          <h2 className="text-xl font-medium mb-2">인증번호가 생성되었습니다</h2>

          <p className="text-gray-600 mb-6">
            <strong>{name}</strong>님의 비밀번호 재설정 인증번호입니다.
          </p>

          <div className="bg-green-50 border border-green-200 p-6 mb-6 rounded-md">
            <p className="text-green-700 font-medium mb-3">6자리 인증번호</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-4xl font-bold tracking-wider text-green-800 font-mono">{resetCode}</p>
              <button
                onClick={copyToClipboard}
                className="p-2 text-green-600 hover:text-green-800 transition-colors"
                title="복사하기"
              >
                {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-green-600 text-sm mt-3">{copied ? "복사되었습니다!" : "클릭하여 복사하세요"}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 mb-6 rounded-md">
            <p className="text-blue-700 text-sm">
              • 이 인증번호는 30분 후에 만료됩니다.
              <br />• 보안을 위해 인증번호를 다른 사람과 공유하지 마세요.
            </p>
          </div>

          <Link
            href={`/login-edit?code=${resetCode}&email=${encodeURIComponent(email)}`}
            className="block w-full bg-green-600 text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-green-700 transition-colors text-center mb-4"
          >
            바로 비밀번호 변경하기
          </Link>

          <Link
            href="/login-edit"
            className="block w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors text-center mb-4"
          >
            인증번호 입력 페이지로 이동
          </Link>

          <Link href="/login" className="text-sm text-gray-700 hover:underline">
            로그인으로 돌아가기
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="text-gray-600 mb-6">이메일과 이름을 입력하시면 비밀번호 재설정 인증번호를 생성해드립니다.</p>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="이름을 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? "생성 중..." : "인증번호 생성"}
          </button>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-700 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
