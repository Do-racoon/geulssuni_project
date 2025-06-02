"use client"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export default function AuthDebug() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()

  const checkAuthMapping = async () => {
    setIsLoading(true)
    try {
      // 1. 현재 Auth 사용자 확인
      const { data: sessionData } = await supabase.auth.getSession()
      const authUser = sessionData?.session?.user

      console.log("Auth User:", authUser)

      // 2. users 테이블에서 이메일로 검색
      const { data: usersByEmail } = await supabase.from("users").select("*").eq("email", "admin@site.com")

      console.log("Users by email:", usersByEmail)

      // 3. users 테이블에서 ID로 검색 (Auth 사용자가 있는 경우)
      let userById = null
      if (authUser) {
        const { data } = await supabase.from("users").select("*").eq("id", authUser.id)
        userById = data
      }

      console.log("User by Auth ID:", userById)

      setDebugResult({
        authUser,
        usersByEmail,
        userById,
        idMatch: authUser && usersByEmail?.[0] ? authUser.id === usersByEmail[0].id : false,
      })
    } catch (error) {
      console.error("Debug error:", error)
      setDebugResult({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const fixUserMapping = async () => {
    setIsLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const authUser = sessionData?.session?.user

      if (!authUser) {
        throw new Error("로그인된 사용자가 없습니다")
      }

      // users 테이블의 admin@site.com 사용자 ID를 Auth 사용자 ID로 업데이트
      const { error } = await supabase.from("users").update({ id: authUser.id }).eq("email", "admin@site.com")

      if (error) {
        throw new Error(`업데이트 실패: ${error.message}`)
      }

      alert("사용자 ID 매핑이 수정되었습니다!")
      await checkAuthMapping()
    } catch (error) {
      console.error("Fix error:", error)
      alert(`수정 실패: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white border p-4 rounded-lg">
      <h3 className="font-bold mb-4">🔍 Auth ID 매핑 디버그</h3>

      <div className="space-y-2 mb-4">
        <button
          onClick={checkAuthMapping}
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "확인 중..." : "Auth 매핑 확인"}
        </button>

        <button
          onClick={fixUserMapping}
          disabled={isLoading}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-gray-400 ml-2"
        >
          {isLoading ? "수정 중..." : "ID 매핑 수정"}
        </button>
      </div>

      {debugResult && (
        <div className="bg-gray-50 p-4 rounded text-sm font-mono">
          <h4 className="font-bold mb-2">결과:</h4>

          {debugResult.error ? (
            <p className="text-red-600">오류: {debugResult.error}</p>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="font-semibold">Auth 사용자 ID:</p>
                <p className="text-blue-600">{debugResult.authUser?.id || "없음"}</p>
                <p>이메일: {debugResult.authUser?.email}</p>
              </div>

              <div>
                <p className="font-semibold">DB 사용자 (이메일로 검색):</p>
                {debugResult.usersByEmail?.map((user: any, index: number) => (
                  <div key={index} className="ml-2">
                    <p className="text-green-600">ID: {user.id}</p>
                    <p>역할: {user.role}</p>
                    <p>이름: {user.name}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="font-semibold">DB 사용자 (Auth ID로 검색):</p>
                {debugResult.userById?.length > 0 ? (
                  debugResult.userById.map((user: any, index: number) => (
                    <div key={index} className="ml-2">
                      <p className="text-green-600">ID: {user.id}</p>
                      <p>역할: {user.role}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-red-600 ml-2">Auth ID로 찾은 사용자 없음</p>
                )}
              </div>

              <div className={`p-2 rounded ${debugResult.idMatch ? "bg-green-100" : "bg-red-100"}`}>
                <p className="font-semibold">ID 매핑 상태: {debugResult.idMatch ? "✅ 일치" : "❌ 불일치"}</p>
                {!debugResult.idMatch && (
                  <p className="text-red-600 text-xs mt-1">
                    Auth ID와 DB ID가 다릅니다. "ID 매핑 수정" 버튼을 클릭하세요.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
