"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  HelpCircle,
  Users2,
  Settings,
  LogOut,
  MessageCircle,
} from "lucide-react"
import type { AdminSection } from "./admin-dashboard"

interface AdminSidebarProps {
  activeSection: AdminSection
  setActiveSection: (section: AdminSection) => void
}

export default function AdminSidebar({ activeSection, setActiveSection }: AdminSidebarProps) {
  const router = useRouter()

  const handleLogout = () => {
    document.cookie = "adminAuth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict"
    router.push("/admin/login")
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "lectures", label: "Lecture Management", icon: BookOpen },
    { id: "books", label: "Book Management", icon: FileText },
    { id: "board", label: "Board Management", icon: MessageSquare },
    { id: "faq", label: "FAQ Management", icon: HelpCircle },
    { id: "authors", label: "Authors Management", icon: Users2 },
    { id: "settings", label: "Settings", icon: Settings },
  ]

  return (
    <div className="w-64 bg-black text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-light tracking-wider">Admin Dashboard</h1>
      </div>

      <div className="p-4 border-b border-gray-800">
        <a
          href="https://www.naver.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center px-4 py-3 text-sm bg-white text-black rounded-md hover:bg-gray-200 transition-colors"
        >
          <MessageCircle className="h-5 w-5 mr-3" />
          Talk
        </a>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveSection(item.id as AdminSection)}
                className={`w-full flex items-center px-4 py-3 text-sm rounded-md transition-colors ${
                  activeSection === item.id ? "bg-white text-black" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors mb-2"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Exit to Website
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm text-red-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  )
}
