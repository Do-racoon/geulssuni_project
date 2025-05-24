"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Menu, X, User, Shield } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isIOS } = useMobile()
  const router = useRouter()

  // Mock authentication state - in a real app, this would come from auth context
  const isLoggedIn = false
  const isAdmin = false

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleNavigation = (path: string) => {
    // Close the menu if it's open
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }

    // Navigate to the path
    router.push(path)

    // Scroll to top
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 transition-all duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
      style={{
        paddingTop: isIOS ? "env(safe-area-inset-top)" : undefined,
        height: isIOS ? `calc(4rem + env(safe-area-inset-top))` : "4rem",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="text-xl font-light tracking-wider"
            onClick={(e) => {
              e.preventDefault()
              handleNavigation("/")
            }}
          >
            GEULSSUNI
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/")
              }}
            >
              Home
            </Link>
            <Link
              href="/about"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/about")
              }}
            >
              About
            </Link>
            <Link
              href="/lectures"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/lectures")
              }}
            >
              Lectures
            </Link>
            <Link
              href="/books"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/books")
              }}
            >
              Books
            </Link>
            <Link
              href="/board"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/board")
              }}
            >
              Board
            </Link>
            <Link
              href="/faq"
              className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
              onClick={(e) => {
                e.preventDefault()
                handleNavigation("/faq")
              }}
            >
              FAQ
            </Link>
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/profile")
                }}
              >
                <User className="h-4 w-4 mr-1" />
                Profile
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/login")
                }}
              >
                Login
              </Link>
            )}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-sm uppercase tracking-wider hover:text-gray-600 transition-colors flex items-center"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/admin")
                }}
              >
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            style={{ touchAction: "manipulation" }} // Improve touch response
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/about")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                About
              </Link>
              <Link
                href="/lectures"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/lectures")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                Lectures
              </Link>
              <Link
                href="/books"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/books")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                Books
              </Link>
              <Link
                href="/board"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/board")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                Board
              </Link>
              <Link
                href="/faq"
                className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  handleNavigation("/faq")
                }}
                style={{ touchAction: "manipulation" }} // Improve touch response
              >
                FAQ
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/profile"
                  className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/profile")
                  }}
                  style={{ touchAction: "manipulation" }} // Improve touch response
                >
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/login")
                  }}
                  style={{ touchAction: "manipulation" }} // Improve touch response
                >
                  Login
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm uppercase tracking-wider py-2 hover:text-gray-600 transition-colors flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    handleNavigation("/admin")
                  }}
                  style={{ touchAction: "manipulation" }} // Improve touch response
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
