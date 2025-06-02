"use client"

import type React from "react"

import { useState } from "react"
import { authorsAPI, handleApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createAuthor } from "@/lib/server-actions"

/**
 * Example component showing how to use the API client
 */
export function AuthorForm() {
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Example using the client-side API
  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      await authorsAPI.create({ name, bio })
      setSuccess(true)
      setName("")
      setBio("")
    } catch (err: any) {
      handleApiError(err, setError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Example using client-side API */}
      <Card>
        <CardHeader>
          <CardTitle>Create Author (Client API)</CardTitle>
        </CardHeader>
        <form onSubmit={handleClientSubmit}>
          <CardContent className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-500">Author created successfully!</p>}

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium">
                Bio
              </label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} required />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Author"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Example using server actions */}
      <Card>
        <CardHeader>
          <CardTitle>Create Author (Server Action)</CardTitle>
        </CardHeader>
        <form action={createAuthor}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name-server" className="text-sm font-medium">
                Name
              </label>
              <Input id="name-server" name="name" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="bio-server" className="text-sm font-medium">
                Bio
              </label>
              <Textarea id="bio-server" name="bio" required />
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit">Create Author</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
