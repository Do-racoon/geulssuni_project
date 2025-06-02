"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface UserCredential {
  email: string
  password: string
  role: string
  name: string
  created_at: string
}

export default function UserInfoPage() {
  const [credentials, setCredentials] = useState<UserCredential[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchCredentials() {
      try {
        const { data, error } = await supabase
          .from("user_credentials")
          .select("*")
          .order("created_at", { ascending: true })

        if (error) {
          console.error("Error fetching credentials:", error)
        } else {
          setCredentials(data || [])
        }
      } catch (error) {
        console.error("Error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCredentials()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">사용자 계정 정보</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {credentials.map((credential, index) => (
          <Card key={index} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{credential.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    credential.role === "admin"
                      ? "bg-red-100 text-red-800"
                      : credential.role === "instructor"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {credential.role === "admin" ? "관리자" : credential.role === "instructor" ? "강사" : "학생"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">이메일</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{credential.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">비밀번호</label>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded">{credential.password}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">생성일</label>
                <p className="text-sm text-gray-500">{new Date(credential.created_at).toLocaleString("ko-KR")}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">위 계정들로 로그인 테스트를 진행할 수 있습니다.</p>
        <div className="space-x-4">
          <a href="/login" className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            일반 로그인
          </a>
          <a href="/admin/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            관리자 로그인
          </a>
        </div>
      </div>
    </div>
  )
}
