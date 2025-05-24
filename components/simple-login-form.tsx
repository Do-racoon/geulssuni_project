"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function SimpleLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("admin@site.com")
  const [password, setPassword] = useState("admin1234")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Login error details:", error)

        // If email not confirmed error, try to create the user with confirmed email
        if (error.message === "Email not confirmed") {
          setMessage("Email not confirmed. Trying to create user with confirmed email...")
          await createAdminUser()
          return
        }

        throw error
      }

      if (data?.user) {
        console.log("Login successful", data.user)
        setMessage("Login successful! Redirecting...")

        // Check if user is admin
        const { data: userData, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (roleError) {
          console.error("Error fetching user role:", roleError)
          // If no role found, assume regular user
          router.push("/profile")
          return
        }

        // Store role in localStorage
        if (userData?.role) {
          localStorage.setItem("userRole", userData.role)
          console.log("User role:", userData.role)

          if (userData.role === "admin") {
            router.push("/admin")
          } else {
            router.push("/profile")
          }
        } else {
          router.push("/profile")
        }
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  // Function to create admin user using server API
  const createAdminUser = async () => {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@site.com",
          password: "admin1234",
          name: "System Administrator",
          role: "admin",
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || "Failed to create admin user")
      }

      setMessage("Admin user created successfully with confirmed email. Please try logging in now.")

      // Try to login automatically after creating the user
      setTimeout(async () => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: "admin@site.com",
          password: "admin1234",
        })

        if (error) {
          console.error("Auto-login error:", error)
          setError("User created but auto-login failed. Please try logging in manually.")
          return
        }

        if (data?.user) {
          setMessage("Login successful! Redirecting...")
          router.push("/admin")
        }
      }, 1000)
    } catch (err) {
      console.error("Admin creation error:", err)
      setError(err instanceof Error ? err.message : "Failed to create admin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Simple Login</h1>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}

      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 mb-4"
        >
          {loading ? "Processing..." : "Login"}
        </button>
      </form>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={createAdminUser}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {loading ? "Creating..." : "Create Admin User"}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          This will create an admin user with email: admin@site.com and password: admin1234
        </p>
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click "Create Admin User" first</li>
          <li>Wait for the success message</li>
          <li>If auto-login doesn't work, click "Login" to sign in</li>
        </ol>
        <p className="mt-2 text-xs text-gray-600">
          This page uses the Supabase Admin API to create a user with confirmed email.
        </p>
      </div>
    </div>
  )
}
