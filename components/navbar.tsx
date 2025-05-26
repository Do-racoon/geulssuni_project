"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User, Shield } from "lucide-react"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null)
    })

    // 인증 상태 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold tracking-wider">
          GEULSSUNI
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            Home
          </Link>
          <Link href="/about" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            About
          </Link>
          <Link href="/lectures" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            Lectures
          </Link>
          <Link href="/books" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            Books
          </Link>
          <Link href="/board" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            Board
          </Link>
          <Link href="/faq" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
            FAQ
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors flex items-center"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
              {user.user_metadata?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors flex items-center"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </>
          ) : (
            <Link href="/login" className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
