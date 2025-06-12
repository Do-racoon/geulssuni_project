"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Camera, X } from "lucide-react"

interface Photo {
  id: string
  title: string
  description: string
  short_description: string
  thumbnail_url: string
}

interface PhotoGalleryProps {
  photos: Photo[]
}

export default function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo)
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-12">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-light tracking-wider mb-4">Photo Gallery</h2>
        <p className="text-gray-600">
          A collection of our finest photography work, capturing moments and emotions through the lens.
        </p>
      </div>

      {/* Decorative Line */}
      <div className="relative">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
      </div>

      {/* Photo Grid or Empty State */}
      {photos.length === 0 ? (
        <div className="text-center py-16">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-light text-gray-500 mb-2">No Photos Available</h3>
          <p className="text-gray-400">Photos will appear here once they are added to the gallery.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              className="group relative overflow-hidden rounded-lg cursor-pointer"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => handlePhotoClick(photo)}
            >
              <div className="aspect-[4/3] relative overflow-hidden">
                <Image
                  src={photo.thumbnail_url || "/placeholder.svg"}
                  alt={photo.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                    {/* Decorative Corner */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white opacity-80" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white opacity-80" />

                    <h3 className="text-xl font-light tracking-wider mb-2">{photo.title}</h3>
                    <p className="text-sm text-gray-200">{photo.short_description}</p>
                    <button className="mt-4 px-4 py-1 border border-white text-sm hover:bg-white hover:text-black transition-colors duration-300">
                      View Photo
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog - 자연스러운 팝업으로 수정 */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white rounded-lg">
          {selectedPhoto && (
            <div className="relative">
              {/* Close Button */}
              <button
                onClick={closeDialog}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col">
                {/* Image */}
                <div className="relative w-full aspect-[16/9]">
                  <Image
                    src={selectedPhoto.thumbnail_url || "/placeholder.svg"}
                    alt={selectedPhoto.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-6 bg-white">
                  <h3 className="text-2xl font-light tracking-wider mb-3">{selectedPhoto.title}</h3>
                  <p className="text-gray-700">{selectedPhoto.description}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
