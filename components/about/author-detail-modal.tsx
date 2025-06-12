"use client"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Author {
  id: string
  name: string
  role: string
  bio: string
  image_url?: string
}

interface AuthorDetailModalProps {
  author: Author
  isOpen: boolean
  onClose: () => void
}

export default function AuthorDetailModal({ author, isOpen, onClose }: AuthorDetailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-medium">{author.name}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 mt-4">
          <div className="relative h-[200px] w-full md:w-[200px]">
            <Image
              src={author.image_url || "/placeholder.svg?height=400&width=400&query=person"}
              alt={author.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
          <div>
            <Badge className="mb-4">{author.role}</Badge>
            <div className="text-gray-700 whitespace-pre-wrap">{author.bio}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
