"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, CheckCircle } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const isAdminLogin = searchParams.get("admin") === "true"

  useEffect(() => {
    // Check if user was redirected from registration
    const registered = searchParams.get("registered")
    if (registered === "true") {
      setSuccessMessage("Account created successfully! Please sign in with your credentials.")
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMessage("")
    setIsLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data?.user) {
        // 성공 메시지 표시
        setSuccessMessage("로그인 성공! 잠시 후 이동합니다...")

        // Check if user is admin
        const { data: userData } = await supabase.from("users").select("role").eq("id", data.user.id).single()

        const isAdmin = userData?.role === "admin"

        // Store role in localStorage for client-side checks
        if (userData?.role && typeof window !== "undefined") {
          localStorage.setItem("userRole", userData.role)
        }

        // 기존 코드에서 setTimeout 제거하고 즉시 리다이렉션
        if (isAdmin) {
          if (isAdminLogin) {
            window.location.href = "/admin"
          } else {
            window.location.href = "/profile"
          }
        } else {
          window.location.href = "/profile"
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 p-8">
      {error && <div className="bg-red-50 text-red-500 p-4 mb-6 text-sm">{error}</div>}

      {successMessage && (
        <div className="bg-green-50 text-green-600 p-4 mb-6 text-sm flex items-start">
          <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
              placeholder="Enter your password"
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

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              className="h-4 w-4 border-gray-300 rounded text-black focus:ring-black"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <Link href="/forgot-password" className="text-sm text-gray-700 hover:underline">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black text-white py-3 px-4 text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-700">
          Don't have an account?{" "}
          <Link href="/register" className="text-black hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
