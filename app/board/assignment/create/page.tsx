"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import AssignmentEditor from "@/components/board/assignment-editor"
import { toast } from "sonner"

export default function CreateAssignmentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    try {
      // Simulate API call to create assignment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real implementation, you would send the formData to your API
      // const response = await fetch('/api/assignments', {
      //   method: 'POST',
      //   body: formData,
      // })

      // if (!response.ok) throw new Error('Failed to create assignment')

      toast.success("Assignment created successfully!")
      router.push("/board")
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast.error("Failed to create assignment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Assignment</CardTitle>
          <CardDescription>
            Share your assignment with the community. Instructors will be able to review and provide feedback.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AssignmentEditor onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  )
}
