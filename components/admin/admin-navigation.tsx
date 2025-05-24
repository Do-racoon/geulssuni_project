"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Users2,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react"
import type { AdminSection } from "./admin-dashboard"

interface AdminNavigationProps {
  activeSection: AdminSection
  setActiveSection: (section: AdminSection) => void
}

export default function AdminNavigation({ activeSection, setActiveSection }: AdminNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleLogout = () => {
    // Clear the auth cookie
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    window.location.href = "/admin/login"
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "lectures", label: "Lectures", icon: BookOpen },
    { id: "books", label: "Books", icon: FileText },
    { id: "board", label: "Board", icon: MessageSquare },
    { id: "faq", label: "FAQ", icon: HelpCircle },
    { id: "authors", label: "Authors", icon: Users2 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile Navigation */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/admin" className="text-xl font-semibold">
          Admin
        </Link>
        <button onClick={toggleMobileMenu} className="p-2 rounded-md hover:bg-gray-100">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-white pt-16">
          <div className="p-4 overflow-y-auto h-full">
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        setActiveSection(item.id as AdminSection)
                        setIsMobileMenuOpen(false)
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
                        activeSection === item.id
                          ? "bg-gray-100 text-black font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <h1 className="text-xl font-semibold">Admin Panel</h1>
        </div>

        <nav className="px-3 py-2">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id as AdminSection)}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                    activeSection === item.id ? "bg-gray-100 text-black font-medium" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors mt-1"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}
