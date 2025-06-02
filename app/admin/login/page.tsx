import type { Metadata } from "next"
import AdminLoginForm from "@/components/admin/admin-login-form"

export const metadata: Metadata = {
  title: "Admin Login | Geulssuni",
  description: "Secure login for Geulssuni administration",
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-light text-center mb-8 tracking-widest uppercase">Admin Access</h1>
        <AdminLoginForm />
      </div>
    </main>
  )
}
