"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"

export default function LoginSuccessToast() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const loginSuccess = searchParams.get("login")
    if (loginSuccess === "success") {
      toast.success("로그인 성공!", {
        description: "환영합니다!",
        duration: 3000,
      })
    }
  }, [searchParams])

  return null
}
