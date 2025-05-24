import type { Metadata } from "next"
import ForgotPasswordForm from "@/components/auth/forgot-password-form"

export const metadata: Metadata = {
  title: "Forgot Password | Geulssuni",
  description: "Reset your Geulssuni account password",
}

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-light text-center mb-8 tracking-widest uppercase">Reset Password</h1>
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
