"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function SupabaseSetupPage() {
  const [authSettings, setAuthSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    checkSupabaseSettings()
  }, [])

  const checkSupabaseSettings = async () => {
    try {
      setLoading(true)
      setError("")

      // Test basic connection
      const { data, error: connectionError } = await supabase.auth.getSession()

      if (connectionError) {
        throw new Error(`Connection failed: ${connectionError.message}`)
      }

      setAuthSettings({
        connected: true,
        session: data.session,
        timestamp: new Date().toISOString(),
      })
    } catch (err) {
      console.error("Supabase setup check error:", err)
      setError(err instanceof Error ? err.message : "Failed to check Supabase settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Supabase Setup Guide</h1>

      {loading && <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded">Checking Supabase connection...</div>}

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {authSettings && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded">
          <strong>✅ Supabase Connection:</strong> Working
          <br />
          <small>Last checked: {new Date(authSettings.timestamp).toLocaleString()}</small>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">🚨 Email Login Issue</h2>
          <p className="mb-4">If you're seeing "Email logins are disabled", follow these steps:</p>

          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>
              Go to your{" "}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Supabase Dashboard
              </a>
            </li>
            <li>Select your project</li>
            <li>
              Navigate to <strong>Authentication → Settings</strong>
            </li>
            <li>
              Scroll down to <strong>"Auth Providers"</strong>
            </li>
            <li>
              Make sure <strong>"Email"</strong> is enabled (toggle should be ON)
            </li>
            <li>
              Click <strong>"Save"</strong>
            </li>
            <li>Wait a few minutes for changes to take effect</li>
          </ol>

          <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p className="text-sm">
              <strong>Note:</strong> Changes may take 1-2 minutes to propagate.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">📋 Environment Variables</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_URL:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>NEXT_PUBLIC_SUPABASE_ANON_KEY:</span>
              <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">🔧 Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={checkSupabaseSettings}
            disabled={loading}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? "Checking..." : "Recheck Connection"}
          </button>

          <a href="/simple-login" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 text-center">
            Try Login Again
          </a>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-center"
          >
            Open Supabase Dashboard
          </a>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold mb-2">📖 Additional Resources:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            <a
              href="https://supabase.com/docs/guides/auth"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Supabase Auth Documentation
            </a>
          </li>
          <li>
            <a
              href="https://supabase.com/docs/guides/auth/auth-email"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Email Authentication Setup
            </a>
          </li>
          <li>
            <a href="/debug-deployment" className="text-blue-600 underline">
              Debug Deployment Page
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
