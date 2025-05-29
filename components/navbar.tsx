"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { User, Shield, Menu, X } from "lucide-react"

export default function Navbar() {
  const [user, setUser] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const handleLogout = async () => {
    try {
      // Clear any stored user data
      if (typeof window !== "undefined") {
        localStorage.removeItem("userRole")
        localStorage.removeItem("adminAuth")
      }

      // Sign out from Supabase
      await supabase.auth.signOut()

      // Force page reload and redirect
      window.location.href = "/login"
    } catch (error) {
      console.error("Error signing out:", error)
      // Force redirect even if there's an error
      window.location.href = "/login"
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="bg-white py-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link href="/" className="text-2xl font-semibold tracking-wider text-gray-800">
          GEULSSUNI
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            About
          </Link>
          <Link
            href="/lectures"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            Lectures
          </Link>
          <Link
            href="/books"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            Books
          </Link>
          <Link
            href="/board"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            Board
          </Link>
          <Link
            href="/faq"
            className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
          >
            FAQ
          </Link>
          {user ? (
            <>
              <Link
                href="/profile"
                className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center text-gray-700"
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
              {user.user_metadata?.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors flex items-center text-gray-700"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700 hover:text-blue-600 transition-colors">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-2 space-y-2">
            <Link
              href="/"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/lectures"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Lectures
            </Link>
            <Link
              href="/books"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Books
            </Link>
            <Link
              href="/board"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Board
            </Link>
            <Link
              href="/faq"
              className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-1 inline" />
                  Profile
                </Link>
                {user.user_metadata?.role === "admin" && (
                  <Link
                    href="/admin"
                    className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4 mr-1 inline" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700 text-left w-full"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="block py-2 text-sm uppercase tracking-wider hover:text-blue-600 transition-colors text-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
