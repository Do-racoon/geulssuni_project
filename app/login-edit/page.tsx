"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function LoginEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [email, setEmail] = useState("")
  const [passwordValidation, setPasswordValidation] = useState({
    hasLowercase: false,
    hasUppercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  })

  useEffect(() => {
    const urlCode = searchParams.get("code")
    const urlEmail = searchParams.get("email")

    if (urlCode) setCode(urlCode)
    if (urlEmail) setEmail(decodeURIComponent(urlEmail))
  }, [searchParams])

  useEffect(() => {
    // 비밀번호 복잡성 검증
    setPasswordValidation({
      hasLowercase: /[a-z]/.test(newPassword),
      hasUppercase: /[A-Z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~]/.test(newPassword),
      hasMinLength: newPassword.length >= 8,
    })
  }, [newPassword])

  const isPasswordValid = () => {
    return Object.values(passwordValidation).every(Boolean)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (!isPasswordValid()) {
      setError("비밀번호가 복잡성 요구사항을 만족하지 않습니다.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/reset-password-with-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          email,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "비밀번호 변경에 실패했습니다.")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white border border-gray-200 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-green-600">비밀번호 변경 완료</h2>
            <p className="text-gray-600 mb-6">
              비밀번호가 성공적으로 변경되었습니다.
              <br />
              잠시 후 로그인 페이지로 이동합니다.
            </p>
            <Link
              href="/login"
              className="inline-block bg-black text-white py-2 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
            >
              로그인하기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">비밀번호 변경</h2>
          <p className="mt-2 text-center text-sm text-gray-600">인증번호를 확인하고 새 비밀번호를 설정하세요</p>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          {error && <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                이메일
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black bg-gray-50"
                placeholder="이메일"
                required
                readOnly
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                인증번호
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="6자리 인증번호를 입력하세요"
                maxLength={6}
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                새 비밀번호
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="새 비밀번호"
                required
              />

              {/* 비밀번호 복잡성 요구사항 표시 */}
              {newPassword && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className="text-gray-600 font-medium mb-1">비밀번호 요구사항:</div>
                  <div
                    className={`flex items-center ${passwordValidation.hasMinLength ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="mr-1">{passwordValidation.hasMinLength ? "✓" : "✗"}</span>
                    최소 8자리
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasLowercase ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="mr-1">{passwordValidation.hasLowercase ? "✓" : "✗"}</span>
                    소문자 포함 (a-z)
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasUppercase ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="mr-1">{passwordValidation.hasUppercase ? "✓" : "✗"}</span>
                    대문자 포함 (A-Z)
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasNumber ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="mr-1">{passwordValidation.hasNumber ? "✓" : "✗"}</span>
                    숫자 포함 (0-9)
                  </div>
                  <div
                    className={`flex items-center ${passwordValidation.hasSpecial ? "text-green-600" : "text-red-500"}`}
                  >
                    <span className="mr-1">{passwordValidation.hasSpecial ? "✓" : "✗"}</span>
                    특수문자 포함 (!@#$%^&* 등)
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                placeholder="비밀번호를 다시 입력하세요"
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <div className="mt-1 text-xs text-red-500">비밀번호가 일치하지 않습니다</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isPasswordValid() || newPassword !== confirmPassword}
              className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "변경 중..." : "비밀번호 변경"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-700 hover:underline">
              로그인으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
