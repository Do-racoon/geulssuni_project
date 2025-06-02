"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { updateLecture } from "@/lib/api/lectures"
import { Loader2 } from "lucide-react"

interface EditLectureModalProps {
  isOpen: boolean
  onClose: () => void
  lectureId: string | null
  initialTitle: string
  initialDescription: string
  onLectureUpdated: () => void
}

const EditLectureModal = ({
  isOpen,
  onClose,
  lectureId,
  initialTitle,
  initialDescription,
  onLectureUpdated,
}: EditLectureModalProps) => {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setDescription(initialDescription)
    }
  }, [isOpen, initialTitle, initialDescription])

  const handleUpdateLecture = async () => {
    if (!lectureId) {
      toast({
        title: "Error",
        description: "Lecture ID is missing.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await updateLecture(lectureId, { title, description })
      toast({
        title: "Lecture updated",
        description: "The lecture has been successfully updated.",
      })
      onLectureUpdated()
      onClose()
    } catch (error: any) {
      console.error("Error updating lecture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update lecture.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Lecture</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdateLecture} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditLectureModal
