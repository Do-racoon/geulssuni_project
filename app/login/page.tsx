import type { Metadata } from "next"
import { Suspense } from "react"
import LoginForm from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login | Geulssuni",
  description: "Sign in to your Geulssuni account",
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-light text-center mb-8 tracking-widest uppercase">Sign In</h1>
        <Suspense fallback={<div className="text-center py-4">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
