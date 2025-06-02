import type { Metadata } from "next"
import UserProfile from "@/components/auth/user-profile"

export const metadata: Metadata = {
  title: "My Profile | Geulssuni",
  description: "Manage your Geulssuni profile and account settings",
}

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">My Profile</h1>
        <UserProfile />
      </div>
    </main>
  )
}
