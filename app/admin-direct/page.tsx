"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabase/client"

export default function AdminDirectPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = getSupabaseClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/admin/login")
          return
        }

        // Check if user is admin
        const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

        if (userData?.role !== "admin") {
          router.push("/admin/login")
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error checking auth:", error)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading admin panel...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Direct Access</h1>
      <p className="mb-4">This is a direct admin access page.</p>
      <p>You can add your admin functionality here.</p>
    </div>
  )
}
