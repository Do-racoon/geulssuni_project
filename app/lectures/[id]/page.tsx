"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import AskQuestion from "@/components/lecture/ask-question"
import FavoriteButton from "@/components/lecture/favorite-button"
import { lectures } from "@/data/lectures"
import { ArrowLeft, Calendar, MapPin, Clock, User, Tag } from "lucide-react"

export default function LectureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lecture, setLecture] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the lecture by ID
    const foundLecture = lectures.find((l) => l.id === params.id)

    if (foundLecture) {
      setLecture(foundLecture)
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl mb-4">Lecture not found</p>
          <Button onClick={() => router.push("/lectures")}>Back to Lectures</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={() => router.push("/lectures")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lectures
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-video mb-6">
          <Image
            src={lecture.thumbnail || "/placeholder.svg?height=400&width=800"}
            alt={lecture.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{lecture.title}</h1>
          <FavoriteButton lectureId={lecture.id} />
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {lecture.author}
          </Badge>

          <Badge variant="outline" className="flex items-center gap-1">
            {lecture.level}
          </Badge>

          {lecture.tags &&
            lecture.tags.map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{lecture.date}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{lecture.time}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span>{lecture.location}</span>
          </div>
        </div>

        <Separator className="mb-6" />

        <div className="prose max-w-none mb-8">
          <h2 className="text-2xl font-semibold mb-4">Description</h2>
          <div dangerouslySetInnerHTML={{ __html: lecture.description }} />
        </div>

        {lecture.contactUrl && (
          <div className="mb-8">
            <Button asChild>
              <Link href={lecture.contactUrl}>Contact for Inquiries</Link>
            </Button>
          </div>
        )}

        <AskQuestion lectureId={lecture.id} />
      </div>
    </div>
  )
}
