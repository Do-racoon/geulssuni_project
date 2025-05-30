"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Plus, Instagram, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuthors, deleteAuthor, type Author } from "@/lib/api/authors"
import { toast } from "@/components/ui/use-toast"

export default function WritersManagement() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAuthors()
  }, [])

  const fetchAuthors = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAuthors()
      setAuthors(data)
    } catch (error) {
      console.error("Error fetching authors:", error)
      setError("Failed to load authors. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAuthor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this author?")) return

    try {
      await deleteAuthor(id)
      setAuthors((prev) => prev.filter((author) => author.id !== id))
      toast({
        title: "Success",
        description: "Author deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting author:", error)
      toast({
        title: "Error",
        description: "Failed to delete author. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredAuthors = authors.filter(
    (author) =>
      author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (author.bio && author.bio.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchAuthors}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authors Management</h2>
        <Button onClick={() => (window.location.href = "/admin?section=authors-management&action=add")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search authors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <Card key={author.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    {author.avatar_url ? (
                      <Image
                        src={author.avatar_url || "/placeholder.svg"}
                        alt={author.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{author.name}</CardTitle>
                    <p className="text-sm text-gray-600">{author.role || "Author"}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      (window.location.href = `/admin?section=authors-management&action=edit&id=${author.id}`)
                    }
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteAuthor(author.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 line-clamp-3">{author.bio || "No biography available."}</p>

              {author.website && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Website:</span>
                  <a
                    href={author.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                  >
                    {author.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Badge variant="secondary">{author.books_count || 0} books</Badge>
                {author.social_instagram && (
                  <a
                    href={`https://instagram.com/${author.social_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAuthors.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? "No authors found matching your search." : "No authors found. Add your first author!"}
          </p>
        </div>
      )}
    </div>
  )
}
