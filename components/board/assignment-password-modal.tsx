"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Lock, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface AssignmentPasswordModalProps {
  assignmentId: string
}

export default function AssignmentPasswordModal({ assignmentId }: AssignmentPasswordModalProps) {
  const [password, setPassword] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState("")
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    // 로컬 스토리지에서 이미 인증된 과제인지 확인
    const verifiedAssignments = JSON.parse(localStorage.getItem("verifiedAssignments") || "[]")
    if (verifiedAssignments.includes(assignmentId)) {
      setIsVerified(true)
    }
  }, [assignmentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.")
      return
    }

    setIsChecking(true)

    try {
      const response = await fetch(`/api/assignments/${assignmentId}/check-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        // 인증 성공
        setIsVerified(true)

        // 로컬 스토리지에 인증된 과제 ID 저장
        const verifiedAssignments = JSON.parse(localStorage.getItem("verifiedAssignments") || "[]")
        if (!verifiedAssignments.includes(assignmentId)) {
          verifiedAssignments.push(assignmentId)
          localStorage.setItem("verifiedAssignments", JSON.stringify(verifiedAssignments))
        }

        toast.success("인증되었습니다.")
      } else {
        const data = await response.json()
        setError(data.error || "비밀번호가 일치하지 않습니다.")
      }
    } catch (error) {
      console.error("비밀번호 확인 오류:", error)
      setError("오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsChecking(false)
    }
  }

  if (isVerified) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 text-gray-800 mx-auto mb-4" />
          <h2 className="text-2xl font-light tracking-widest uppercase mb-2">PASSWORD PROTECTED</h2>
          <p className="text-gray-600 tracking-wide">
            This assignment is password protected. Please enter the password to view.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-black"
              style={{ borderRadius: "0" }}
            />
            {error && (
              <div className="flex items-center text-red-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isChecking}
            className="w-full bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
            style={{ borderRadius: "0" }}
          >
            {isChecking ? "CHECKING..." : "SUBMIT"}
          </Button>
        </form>
      </div>
    </div>
  )
}
