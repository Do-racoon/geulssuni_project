"use client"

import { useState } from "react"
import AdminNavigation from "./admin-navigation"
import AdminOverview from "./sections/admin-overview"
import UserManagement from "./sections/user-management"
import LectureManagement from "./sections/lecture-management"
import BookManagement from "./sections/book-management"
import AssignmentReview from "./sections/assignment-review"
import FAQManagement from "./sections/faq-management"
import AdminSettings from "./sections/admin-settings"
import BoardManagement from "./sections/board-management"
import AuthorsManagement from "./sections/writers-management"

export type AdminSection =
  | "overview"
  | "users"
  | "lectures"
  | "books"
  | "assignments"
  | "faq"
  | "settings"
  | "board"
  | "authors"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>("overview")

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminNavigation activeSection={activeSection} setActiveSection={setActiveSection} />

      <div className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {activeSection === "overview" && <AdminOverview />}
          {activeSection === "users" && <UserManagement />}
          {activeSection === "lectures" && <LectureManagement />}
          {activeSection === "books" && <BookManagement />}
          {activeSection === "assignments" && <AssignmentReview />}
          {activeSection === "faq" && <FAQManagement />}
          {activeSection === "settings" && <AdminSettings />}
          {activeSection === "board" && <BoardManagement />}
          {activeSection === "authors" && <AuthorsManagement />}
        </div>
      </div>
    </div>
  )
}
