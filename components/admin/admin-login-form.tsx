"use client"

import type React from "react"
import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface AdminLoginFormProps {
  onLoginSuccess?: () => void
}

export default function AdminLoginForm({ onLoginSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(`인증 실패: ${error.message}`)
      }

      if (data?.user) {
        const authUserId = data.user.id

        // 이메일로 사용자 조회
        const { data: usersByEmail, error: emailError } = await supabase.from("users").select("*").eq("email", email)

        let userData = null

        // 이메일로 찾은 사용자가 있으면 사용
        if (usersByEmail && usersByEmail.length > 0) {
          userData = usersByEmail[0]

          // Auth ID와 DB ID가 다르면 업데이트
          if (userData.id !== authUserId) {
            const { error: updateError } = await supabase.from("users").update({ id: authUserId }).eq("email", email)

            if (!updateError) {
              userData.id = authUserId
            }
          }
        }
        // 사용자가 없으면 새로 생성
        else {
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                id: authUserId,
                email: email,
                name: "관리자",
                role: "admin",
                is_active: true,
                email_verified: true,
              },
            ])
            .select()
            .single()

          if (createError) {
            throw new Error(`사용자 생성 실패: ${createError.message}`)
          }

          userData = newUser
        }

        if (!userData) {
          throw new Error("사용자 데이터를 찾을 수 없습니다.")
        }

        if (userData.role !== "admin") {
          await supabase.auth.signOut()
          throw new Error(`관리자 권한이 없습니다.`)
        }

        // 성공 시 콜백 호출 또는 리다이렉트
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          // 명시적으로 /admin으로 리다이렉트
          window.location.href = "/admin"
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">관리자 로그인</h2>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm rounded">
          <p className="font-semibold">로그인 실패</p>
          <p>{error}</p>
        </div>
      )}

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
            className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black rounded"
            placeholder="관리자 이메일을 입력하세요"
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black rounded"
              placeholder="비밀번호를 입력하세요"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>
    </div>
  )
}
