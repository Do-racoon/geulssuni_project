"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Plus, Search, Trash2, Edit, Eye, AlertCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import AddPhotoModal from "../modals/add-photo-modal"
import EditPhotoModal from "../modals/edit-photo-modal"
import { useToast } from "@/components/ui/use-toast"

interface Photo {
  id: string
  title: string
  description: string
  short_description: string
  thumbnail_url: string
  created_at: string
}

export default function PhotoManagement() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [tableExists, setTableExists] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPhotos()
  }, [])

  async function fetchPhotos() {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("photo").select("*").order("created_at", { ascending: false })

      if (error) {
        if (error.message.includes('relation "public.photo" does not exist')) {
          setTableExists(false)
          setPhotos([])
          return
        }
        throw error
      }

      setTableExists(true)
      setPhotos(data || [])
    } catch (error) {
      console.error("Error fetching photos:", error)
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddPhoto = async (newPhoto: Omit<Photo, "id" | "created_at">) => {
    try {
      const { data, error } = await supabase.from("photo").insert([newPhoto]).select()

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Photo added successfully",
      })

      setIsAddModalOpen(false)
      fetchPhotos()
    } catch (error) {
      console.error("Error adding photo:", error)
      toast({
        title: "Error",
        description: "Failed to add photo",
        variant: "destructive",
      })
    }
  }

  const handleEditPhoto = async (updatedPhoto: Partial<Photo>) => {
    if (!selectedPhoto) return

    try {
      const { error } = await supabase.from("photo").update(updatedPhoto).eq("id", selectedPhoto.id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Photo updated successfully",
      })

      setIsEditModalOpen(false)
      fetchPhotos()
    } catch (error) {
      console.error("Error updating photo:", error)
      toast({
        title: "Error",
        description: "Failed to update photo",
        variant: "destructive",
      })
    }
  }

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      setIsDeleting(true)
      const { error } = await supabase.from("photo").delete().eq("id", id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      })

      fetchPhotos()
    } catch (error) {
      console.error("Error deleting photo:", error)
      toast({
        title: "Error",
        description: "Failed to delete photo",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredPhotos = photos.filter(
    (photo) =>
      photo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      photo.short_description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (!tableExists) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Photo Management</h2>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The photo table doesn't exist yet. Please run the SQL script to create the photo table first.
            <br />
            <code className="mt-2 block bg-gray-100 p-2 rounded text-sm">scripts/create-photo-table.sql</code>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Photo Management</h2>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Photo
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search photos..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thumbnail
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Short Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPhotos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                      No photos found
                    </td>
                  </tr>
                ) : (
                  filteredPhotos.map((photo) => (
                    <tr key={photo.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-12 w-16 relative rounded overflow-hidden">
                          <img
                            src={photo.thumbnail_url || "/placeholder.svg"}
                            alt={photo.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{photo.title}</td>
                      <td className="px-6 py-4">
                        <div className="max-w-xs truncate">{photo.short_description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPhoto(photo)
                              setIsViewModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPhoto(photo)
                              setIsEditModalOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleDeletePhoto(photo.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Photo Modal */}
      <AddPhotoModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddPhoto} />

      {/* Edit Photo Modal */}
      {selectedPhoto && (
        <EditPhotoModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          photo={selectedPhoto}
          onSubmit={handleEditPhoto}
        />
      )}

      {/* View Photo Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="aspect-[4/3] relative rounded-lg overflow-hidden">
              {selectedPhoto && (
                <img
                  src={selectedPhoto.thumbnail_url || "/placeholder.svg"}
                  alt={selectedPhoto.title}
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Short Description</h3>
                <p>{selectedPhoto?.short_description}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Description</h3>
                <p>{selectedPhoto?.description}</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
