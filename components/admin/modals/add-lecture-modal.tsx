"use client"

import type React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createLecture } from "@/lib/api/lectures"
import { useState } from "react"

interface AddLectureModalProps {
  courseId: string
  children: React.ReactNode
}

export default function AddLectureModal({ courseId, children }: AddLectureModalProps) {
  const [title, setTitle] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [isPending, setIsPending] = useState(false)
  const { toast } = useToast()

  const onSubmit = async () => {
    setIsPending(true)
    try {
      await createLecture({
        title,
        videoUrl,
        courseId,
      })
      toast({
        title: "Success",
        description: "Lecture created successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create lecture",
        variant: "destructive",
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Add New Lecture</AlertDialogTitle>
          <AlertDialogDescription>
            Add a new lecture to the course. Make sure to fill all the fields.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="videoUrl" className="text-right">
              Video URL
            </Label>
            <Input
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSubmit} disabled={isPending}>
            {isPending ? "Creating..." : "Create"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
