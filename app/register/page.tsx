import type { Metadata } from "next"
import RegisterForm from "@/components/auth/register-form"

export const metadata: Metadata = {
  title: "Sign Up | Creative Agency",
  description: "Create a new account with Creative Agency",
}

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center py-12">
      <div className="w-full max-w-md p-8">
        <h1 className="text-3xl font-light text-center mb-8 tracking-widest uppercase">Create Account</h1>
        <RegisterForm />
      </div>
    </main>
  )
}
