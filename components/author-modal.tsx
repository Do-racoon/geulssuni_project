"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Instagram } from "lucide-react"

interface Author {
  id: string
  name: string
  profession: string
  experience: string
  numberOfWorks: number
  quote: string
  instagramUrl: string
  imageUrl: string
  likes: number
}

interface AuthorModalProps {
  author: Author | null
  isOpen: boolean
  onClose: () => void
}

export default function AuthorModal({ author, isOpen, onClose }: AuthorModalProps) {
  const [isLiked, setIsLiked] = useState(false)

  if (!author) return null

  const handleLike = () => {
    setIsLiked(!isLiked)
    // In a real app, you would update the likes count in the database
    // and sync it with the frontend immediately
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Author Profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={author.imageUrl || "/placeholder.svg"} alt={author.name} />
            <AvatarFallback>{author.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h3 className="text-xl font-bold">{author.name}</h3>
            <p className="text-muted-foreground">{author.profession}</p>
          </div>

          <div className="w-full space-y-4 px-2">
            <div className="flex justify-between">
              <Badge variant="outline" className="px-3 py-1">
                {author.numberOfWorks} Works
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                {author.likes} Likes
              </Badge>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <p className="italic text-center">"{author.quote}"</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Experience</h4>
              <p className="text-sm text-muted-foreground">{author.experience}</p>
            </div>

            <div className="flex justify-between">
              {author.instagramUrl && (
                <a
                  href={author.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-500 hover:underline"
                >
                  <Instagram className="mr-2 h-4 w-4" />
                  Follow on Instagram
                </a>
              )}

              <Button
                variant={isLiked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className={isLiked ? "bg-pink-500 hover:bg-pink-600" : ""}
              >
                {isLiked ? "Liked" : "Like"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
