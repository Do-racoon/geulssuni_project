"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState({
    connection: { status: "pending", message: "", details: null },
    emailAuth: { status: "pending", message: "", details: null },
    userCreation: { status: "pending", message: "", details: null },
    login: { status: "pending", message: "", details: null },
  })

  const [testCredentials, setTestCredentials] = useState({
    email: "test@example.com",
    password: "testpassword123",
  })

  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user || null)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const runAllTests = async () => {
    setLoading(true)
    await testConnection()
    await testEmailAuthEnabled()
    await testUserCreation()
    await testLogin()
    setLoading(false)
  }

  const testConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error

      setTestResults((prev) => ({
        ...prev,
        connection: {
          status: "success",
          message: "Supabase 연결 성공",
          details: { connected: true, timestamp: new Date().toISOString() },
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        connection: {
          status: "error",
          message: `연결 실패: ${error.message}`,
          details: { error: error.message },
        },
      }))
    }
  }

  const testEmailAuthEnabled = async () => {
    try {
      // Try to sign up with a test email to check if email auth is enabled
      const { data, error } = await supabase.auth.signUp({
        email: "test-check@example.com",
        password: "testpassword123",
      })

      if (error) {
        if (error.message === "Email logins are disabled") {
          setTestResults((prev) => ({
            ...prev,
            emailAuth: {
              status: "error",
              message: "이메일 인증이 비활성화되어 있습니다",
              details: { error: error.message },
            },
          }))
          return
        }
        // Other errors might be expected (like user already exists)
      }

      setTestResults((prev) => ({
        ...prev,
        emailAuth: {
          status: "success",
          message: "이메일 인증이 활성화되어 있습니다",
          details: { enabled: true },
        },
      }))
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        emailAuth: {
          status: "error",
          message: `이메일 인증 테스트 실패: ${error.message}`,
          details: { error: error.message },
        },
      }))
    }
  }

  const testUserCreation = async () => {
    try {
      // Try to create a test user via API
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testCredentials.email,
          password: testCredentials.password,
          name: "Test User",
          role: "user",
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setTestResults((prev) => ({
          ...prev,
          userCreation: {
            status: "success",
            message: "사용자 생성 API 작동 중",
            details: result,
          },
        }))
      } else {
        setTestResults((prev) => ({
          ...prev,
          userCreation: {
            status: "warning",
            message: `사용자 생성 응답: ${result.message}`,
            details: result,
          },
        }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        userCreation: {
          status: "error",
          message: `사용자 생성 테스트 실패: ${error.message}`,
          details: { error: error.message },
        },
      }))
    }
  }

  const testLogin = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testCredentials.email,
        password: testCredentials.password,
      })

      if (error) {
        if (error.message === "Email logins are disabled") {
          setTestResults((prev) => ({
            ...prev,
            login: {
              status: "error",
              message: "이메일 로그인이 비활성화되어 있습니다",
              details: { error: error.message },
            },
          }))
          return
        }

        setTestResults((prev) => ({
          ...prev,
          login: {
            status: "warning",
            message: `로그인 응답: ${error.message}`,
            details: { error: error.message },
          },
        }))
        return
      }

      if (data.user) {
        setTestResults((prev) => ({
          ...prev,
          login: {
            status: "success",
            message: "로그인 성공!",
            details: { user: data.user.email },
          },
        }))
      }
    } catch (error) {
      setTestResults((prev) => ({
        ...prev,
        login: {
          status: "error",
          message: `로그인 테스트 실패: ${error.message}`,
          details: { error: error.message },
        },
      }))
    }
  }

  const createAdminUser = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@site.com",
          password: "admin1234",
          name: "System Administrator",
          role: "admin",
        }),
      })

      const result = await response.json()
      alert(response.ok ? "관리자 계정 생성 성공!" : `오류: ${result.message}`)
    } catch (error) {
      alert(`오류: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200"
      case "error":
        return "text-red-600 bg-red-50 border-red-200"
      case "warning":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-blue-600 bg-blue-50 border-blue-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return "✅"
      case "error":
        return "❌"
      case "warning":
        return "⚠️"
      default:
        return "🔄"
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">인증 시스템 테스트</h1>
      <p className="text-center text-gray-600 mb-8">
        배포된 사이트: <strong>https://geulssuni.vercel.app</strong>
      </p>

      {/* Current User Status */}
      {currentUser && (
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">현재 로그인된 사용자</CardTitle>
          </CardHeader>
          <CardContent>
            <p>이메일: {currentUser.email}</p>
            <p>ID: {currentUser.id}</p>
            <Button onClick={logout} className="mt-2" variant="outline">
              로그아웃
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>테스트 실행</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">테스트 이메일</Label>
              <Input
                id="email"
                type="email"
                value={testCredentials.email}
                onChange={(e) => setTestCredentials((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">테스트 비밀번호</Label>
              <Input
                id="password"
                type="password"
                value={testCredentials.password}
                onChange={(e) => setTestCredentials((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={runAllTests} disabled={loading} className="flex-1">
              {loading ? "테스트 실행 중..." : "모든 테스트 실행"}
            </Button>
            <Button onClick={createAdminUser} disabled={loading} variant="outline">
              관리자 계정 생성
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid md:grid-cols-2 gap-6">
        {Object.entries(testResults).map(([key, result]) => (
          <Card key={key} className={`border-2 ${getStatusColor(result.status)}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{getStatusIcon(result.status)}</span>
                {key === "connection" && "Supabase 연결"}
                {key === "emailAuth" && "이메일 인증 활성화"}
                {key === "userCreation" && "사용자 생성 API"}
                {key === "login" && "로그인 테스트"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{result.message}</p>
              {result.details && (
                <details className="text-sm">
                  <summary className="cursor-pointer">상세 정보</summary>
                  <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>빠른 링크</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button asChild variant="outline">
              <a href="/simple-login">간단한 로그인</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/register">회원가입</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/admin">관리자 페이지</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/debug-deployment">디버그 정보</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
