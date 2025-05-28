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
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = createClientComponentClient()

  const performLogin = async (loginEmail: string, loginPassword: string) => {
    setError("")
    setIsLoading(true)
    setDebugInfo(null)

    try {
      console.log("🔐 Attempting login with:", loginEmail)

      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      })

      if (error) {
        throw new Error(`인증 실패: ${error.message}`)
      }

      console.log("✅ Auth login successful:", data)

      if (data?.user) {
        const authUserId = data.user.id
        console.log("🆔 Auth User ID:", authUserId)

        // 먼저 이메일로 사용자 조회 (더 안전함)
        const { data: usersByEmail, error: emailError } = await supabase
          .from("users")
          .select("*")
          .eq("email", loginEmail)

        console.log("📧 Users by email:", usersByEmail, emailError)

        // ID로도 조회해보기
        const { data: usersById, error: idError } = await supabase.from("users").select("*").eq("id", authUserId)

        console.log("🆔 Users by ID:", usersById, idError)

        setDebugInfo({
          authUserId,
          usersByEmail,
          usersById,
          emailError,
          idError,
        })

        let userData = null

        // 이메일로 찾은 사용자가 있으면 사용
        if (usersByEmail && usersByEmail.length > 0) {
          userData = usersByEmail[0]
          console.log("✅ Using user found by email:", userData)

          // Auth ID와 DB ID가 다르면 업데이트
          if (userData.id !== authUserId) {
            console.log("🔄 Updating user ID to match Auth ID")
            const { error: updateError } = await supabase
              .from("users")
              .update({ id: authUserId })
              .eq("email", loginEmail)

            if (updateError) {
              console.error("❌ Failed to update user ID:", updateError)
            } else {
              console.log("✅ User ID updated successfully")
              userData.id = authUserId
            }
          }
        }
        // ID로 찾은 사용자가 있으면 사용
        else if (usersById && usersById.length > 0) {
          userData = usersById[0]
          console.log("✅ Using user found by ID:", userData)
        }
        // 둘 다 없으면 새로 생성
        else {
          console.log("🆕 Creating new user record")
          const { data: newUser, error: createError } = await supabase
            .from("users")
            .insert([
              {
                id: authUserId,
                email: loginEmail,
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
          console.log("✅ New user created:", userData)
        }

        if (!userData) {
          throw new Error("사용자 데이터를 찾을 수 없습니다.")
        }

        if (userData.role !== "admin") {
          await supabase.auth.signOut()
          throw new Error(`관리자 권한이 없습니다. 현재 역할: ${userData.role}`)
        }

        console.log("🎉 Admin login successful!")

        // 성공 시 콜백 호출
        if (onLoginSuccess) {
          onLoginSuccess()
        } else {
          window.location.reload()
        }
      }
    } catch (err) {
      console.error("❌ Login error:", err)
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await performLogin(email, password)
  }

  const quickLogin = async (quickEmail: string, quickPassword: string) => {
    setEmail(quickEmail)
    setPassword(quickPassword)
    await performLogin(quickEmail, quickPassword)
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

      {debugInfo && (
        <div className="bg-blue-50 text-blue-700 p-4 mb-6 text-xs rounded">
          <p className="font-semibold mb-2">디버그 정보:</p>
          <div className="space-y-1">
            <p>
              <strong>Auth ID:</strong> {debugInfo.authUserId}
            </p>
            <p>
              <strong>Email 조회:</strong> {debugInfo.usersByEmail?.length || 0}개
            </p>
            <p>
              <strong>ID 조회:</strong> {debugInfo.usersById?.length || 0}개
            </p>
            {debugInfo.usersByEmail?.[0] && (
              <p>
                <strong>DB Role:</strong> {debugInfo.usersByEmail[0].role}
              </p>
            )}
          </div>
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
          className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400 rounded mb-4"
        >
          {isLoading ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="border-t pt-4">
        <p className="text-sm text-gray-600 mb-3 text-center">빠른 로그인:</p>
        <div className="space-y-2">
          <button
            onClick={() => quickLogin("admin@site.com", "password123")}
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 text-sm hover:bg-blue-700 transition-colors disabled:bg-gray-400 rounded"
          >
            관리자로 로그인 (admin@site.com)
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded text-sm">
        <h3 className="font-semibold mb-2">테스트 계정:</h3>
        <div className="space-y-1 text-gray-600">
          <p>
            <strong>관리자:</strong> admin@site.com / password123
          </p>
        </div>
      </div>
    </div>
  )
}
