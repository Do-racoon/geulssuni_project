"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Camera, Save } from "lucide-react"
import { auth } from "@/lib/auth"
import type { User } from "@supabase/supabase-js"

export default function UserProfile() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    className: "",
  })

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true)
        const currentUser = await auth.getUser()

        if (!currentUser) {
          router.push("/login")
          return
        }

        setUser(currentUser)

        // Get user metadata
        const metadata = currentUser.user_metadata || {}
        setUserData(metadata)

        // Set form data
        setFormData({
          name: metadata.name || "",
          nickname: metadata.nickname || "",
          email: currentUser.email || "",
          className: metadata.className || "",
        })
      } catch (error) {
        console.error("Error loading user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSave = async () => {
    try {
      // Update user metadata
      const { error } = await auth.updateUser({
        name: formData.name,
        nickname: formData.nickname,
        className: formData.className,
      })

      if (error) {
        throw new Error(error.message)
      }

      // Update local state
      setUserData({
        ...userData,
        name: formData.name,
        nickname: formData.nickname,
        className: formData.className,
      })

      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Failed to update profile. Please try again.")
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleDeleteAccount = async () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // In a real app, you would call an API to delete the user account
        // For now, we'll just sign out
        await auth.signOut()
        router.push("/login")
        router.refresh()
      } catch (error) {
        console.error("Error deleting account:", error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="text-center py-8">
        <p>Please log in to view your profile.</p>
        <button onClick={() => router.push("/login")} className="mt-4 px-4 py-2 bg-black text-white">
          Go to Login
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white border border-gray-200 p-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/3">
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src={userData.avatar_url || "/placeholder.svg?height=200&width=200"}
                alt={userData.name || "User"}
                fill
                className="object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-black text-white rounded-full">
                <Camera className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 text-center">
              <div className="text-xl font-light">{userData.name || "User"}</div>
              <div className="text-sm text-gray-500 mt-1">
                {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "User"}
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <button
                onClick={handleLogout}
                className="w-full py-2 px-4 border border-gray-200 text-sm text-center hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full py-2 px-4 border border-red-200 text-red-500 text-sm text-center hover:bg-red-50 transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>

          <div className="md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-light">Account Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm underline hover:text-gray-600 transition-colors"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="flex items-center text-sm bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </button>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                ) : (
                  <div className="p-3 border border-gray-100 bg-gray-50">{userData.name || "Not set"}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                  />
                ) : (
                  <div className="p-3 border border-gray-100 bg-gray-50">{userData.nickname || "Not set"}</div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="p-3 border border-gray-100 bg-gray-50">{user.email}</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <div className="p-3 border border-gray-100 bg-gray-50">
                  {userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : "User"}
                </div>
              </div>

              {userData.role === "student" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="className"
                      value={formData.className}
                      onChange={handleChange}
                      className="w-full border border-gray-200 p-3 focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  ) : (
                    <div className="p-3 border border-gray-100 bg-gray-50">{userData.className || "Not set"}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
