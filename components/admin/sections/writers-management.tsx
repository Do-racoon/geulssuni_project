"use client"

import { useState, useEffect } from "react"
import { Edit, Trash2, Plus, Heart, Instagram, Search } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AddWriterModal from "../modals/add-writer-modal"
import EditWriterModal from "../modals/edit-writer-modal"
import { getWriters, deleteWriter, type Writer } from "@/lib/api/writers"

export default function WritersManagement() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingWriter, setEditingWriter] = useState<string | null>(null)
  const [deletingWriter, setDeletingWriter] = useState<string | null>(null)

  useEffect(() => {
    fetchWriters()
  }, [])

  const fetchWriters = async () => {
    try {
      setLoading(true)
      const data = await getWriters()
      setWriters(data)
    } catch (error) {
      console.error("Error fetching writers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddWriter = (newWriter: Writer) => {
    setWriters((prev) => [newWriter, ...prev])
  }

  const handleUpdateWriter = (updatedWriter: Writer) => {
    setWriters((prev) => prev.map((writer) => (writer.id === updatedWriter.id ? updatedWriter : writer)))
  }

  const handleDeleteWriter = async (id: string) => {
    if (!confirm("Are you sure you want to delete this writer?")) return

    try {
      setDeletingWriter(id)
      await deleteWriter(id)
      setWriters((prev) => prev.filter((writer) => writer.id !== id))
    } catch (error) {
      console.error("Error deleting writer:", error)
      alert("Failed to delete writer. Please try again.")
    } finally {
      setDeletingWriter(null)
    }
  }

  const filteredWriters = writers.filter(
    (writer) =>
      writer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      writer.profession.toLowerCase().includes(searchTerm.toLowerCase()),
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Writers Management</h2>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Writer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search writers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWriters.map((writer) => (
          <Card key={writer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                    {writer.image_url ? (
                      <Image
                        src={writer.image_url || "/placeholder.svg"}
                        alt={writer.name}
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: `${writer.image_position_x || 50}% ${writer.image_position_y || 50}%`,
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{writer.name}</CardTitle>
                    <p className="text-sm text-gray-600">{writer.profession}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingWriter(writer.id)} className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteWriter(writer.id)}
                    disabled={deletingWriter === writer.id}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700 line-clamp-3">{writer.experience}</p>

              {writer.quote && (
                <blockquote className="text-sm italic text-gray-600 border-l-2 border-gray-200 pl-3">
                  "{writer.quote}"
                </blockquote>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary">{writer.number_of_works} works</Badge>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Heart className="h-4 w-4" />
                    <span>{writer.likes}</span>
                  </div>
                </div>
                {writer.instagram_url && (
                  <a
                    href={writer.instagram_url}
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

      {filteredWriters.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">
            {searchTerm ? "No writers found matching your search." : "No writers found. Add your first writer!"}
          </p>
        </div>
      )}

      {showAddModal && <AddWriterModal onClose={() => setShowAddModal(false)} onAdd={handleAddWriter} />}

      {editingWriter && (
        <EditWriterModal
          writerId={editingWriter}
          onClose={() => setEditingWriter(null)}
          onUpdate={handleUpdateWriter}
        />
      )}
    </div>
  )
}
