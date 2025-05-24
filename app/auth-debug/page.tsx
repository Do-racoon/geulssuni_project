"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AuthDebugPage() {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [dbUser, setDbUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [envVars, setEnvVars] = useState({})

  useEffect(() => {
    async function checkAuth() {
      try {
        setLoading(true)
        setError(null)

        // Check environment variables
        const env = {
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "Not set",
          supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
        }
        setEnvVars(env)

        console.log("Checking authentication...")

        // Get current session (this should not throw an error)
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        console.log("Session data:", sessionData)
        console.log("Session error:", sessionError)

        if (sessionError) {
          console.error("Session error:", sessionError)
          setError(`Session error: ${sessionError.message}`)
          return
        }

        setSession(sessionData.session)

        // Only try to get user if we have a session
        if (sessionData.session) {
          console.log("Getting user data...")
          const { data: userData, error: userError } = await supabase.auth.getUser()
          console.log("User data:", userData)
          console.log("User error:", userError)

          if (userError) {
            console.error("User error:", userError)
            setError(`User error: ${userError.message}`)
            return
          }

          setUser(userData.user)

          // Get user data from database
          if (userData.user) {
            console.log("Getting database user data...")
            const { data: dbUserData, error: dbUserError } = await supabase
              .from("users")
              .select("*")
              .eq("id", userData.user.id)
              .single()

            console.log("DB User data:", dbUserData)
            console.log("DB User error:", dbUserError)

            if (dbUserError && dbUserError.code !== "PGRST116") {
              console.error("DB User error:", dbUserError)
              setError(`Database error: ${dbUserError.message}`)
              return
            }

            setDbUser(dbUserData)
          }
        } else {
          console.log("No session found")
        }
      } catch (err) {
        console.error("Auth debug error:", err)
        setError(`Unexpected error: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Sign out error:", error)
        setError(`Sign out error: ${error.message}`)
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error("Sign out error:", err)
      setError(`Sign out error: ${err.message}`)
    }
  }

  const testLogin = async () => {
    try {
      setError(null)
      console.log("Testing login...")

      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@site.com",
        password: "admin1234",
      })

      console.log("Login test data:", data)
      console.log("Login test error:", error)

      if (error) {
        setError(`Login test error: ${error.message}`)
      } else {
        setError("Login test successful! Refreshing page...")
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (err) {
      console.error("Login test error:", err)
      setError(`Login test error: ${err.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug Page</h1>

      {loading ? (
        <div className="text-center">Loading authentication data...</div>
      ) : (
        <div className="space-y-8">
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
              <strong>Error:</strong> {error}
            </div>
          )}

          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Environment Variables</h2>
            <div className="space-y-1">
              <div>Supabase URL: {envVars.supabaseUrl}</div>
              <div>Supabase Anon Key: {envVars.supabaseAnonKey}</div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
            <div className="text-lg font-medium">
              {session ? (
                <span className="text-green-600">✅ Authenticated</span>
              ) : (
                <span className="text-red-600">❌ Not Authenticated</span>
              )}
            </div>
          </div>

          {user && (
            <div className="p-4 bg-gray-100 rounded">
              <h2 className="text-xl font-semibold mb-2">Auth User Data</h2>
              <div className="space-y-2">
                <div>
                  <strong>ID:</strong> {user.id}
                </div>
                <div>
                  <strong>Email:</strong> {user.email}
                </div>
                <div>
                  <strong>Email Confirmed:</strong> {user.email_confirmed_at ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Created:</strong> {user.created_at}
                </div>
              </div>
            </div>
          )}

          {dbUser && (
            <div className="p-4 bg-gray-100 rounded">
              <h2 className="text-xl font-semibold mb-2">Database User Data</h2>
              <div className="space-y-2">
                <div>
                  <strong>ID:</strong> {dbUser.id}
                </div>
                <div>
                  <strong>Email:</strong> {dbUser.email}
                </div>
                <div>
                  <strong>Name:</strong> {dbUser.name}
                </div>
                <div>
                  <strong>Role:</strong> {dbUser.role}
                </div>
                <div>
                  <strong>Active:</strong> {dbUser.is_active ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Email Verified:</strong> {dbUser.email_verified ? "Yes" : "No"}
                </div>
              </div>
            </div>
          )}

          <div className="p-4 bg-gray-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Actions</h2>
            <div className="space-y-2">
              {session ? (
                <button onClick={handleSignOut} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                  Sign Out
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={testLogin}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                  >
                    Test Login (admin@site.com)
                  </button>
                  <a
                    href="/simple-login"
                    className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Go to Simple Login
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
            <h2 className="text-xl font-semibold mb-2">Troubleshooting Steps</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Check that environment variables are set correctly</li>
              <li>Try the "Test Login" button above</li>
              <li>If you get "Email not confirmed" error, disable email confirmation in Supabase dashboard</li>
              <li>Go to Supabase Dashboard → Authentication → Settings → Disable "Enable email confirmations"</li>
              <li>If login works but no database user, check that the user was created in the users table</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
