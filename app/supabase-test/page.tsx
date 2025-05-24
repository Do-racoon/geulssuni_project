"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function SupabaseTestPage() {
  const [connectionStatus, setConnectionStatus] = useState("Testing...")
  const [userCount, setUserCount] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function testConnection() {
      try {
        // Test basic connection by counting users
        const { data, error, count } = await supabase.from("users").select("*", { count: "exact", head: true })

        if (error) {
          setError(error.message)
          setConnectionStatus("❌ Connection Failed")
        } else {
          setConnectionStatus("✅ Connection Successful")
          setUserCount(count)
        }
      } catch (err) {
        setError(err.message)
        setConnectionStatus("❌ Connection Failed")
      }
    }

    testConnection()
  }, [])

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Supabase Connection Test</h1>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className="text-lg">{connectionStatus}</div>
        </div>

        {userCount !== null && (
          <div className="p-4 bg-green-100 rounded">
            <h2 className="text-xl font-semibold mb-2">Database Info</h2>
            <div>Users in database: {userCount}</div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <div>{error}</div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded">
          <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
          <div className="space-y-2">
            <a href="/auth-debug" className="block text-blue-600 hover:underline">
              → Go to Auth Debug Page
            </a>
            <a href="/simple-login" className="block text-blue-600 hover:underline">
              → Go to Simple Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
