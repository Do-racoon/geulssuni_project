"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import AskQuestionButton from "@/components/ask-question-button"
import { ArrowLeft, Clock, User, Tag, DollarSign } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Lecture {
  id: string
  title: string
  description?: string
  thumbnail_url?: string
  duration?: number
  category?: string
  tags?: string[]
  contact_url?: string
  price?: number
  is_published?: boolean
  instructor?: string
}

export default function LectureDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [lecture, setLecture] = useState<Lecture | null>(null)
  const [loading, setLoading] = useState(true)
  const [defaultContactUrl, setDefaultContactUrl] = useState("")

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

        if (!uuidRegex.test(params.id)) {
          setLecture(null)
          setLoading(false)
          return
        }

        const { data, error } = await supabase.from("lectures").select("*").eq("id", params.id).limit(1)

        if (error) {
          console.error("Error fetching lecture:", error)
          setLecture(null)
        } else if (data && data.length > 0) {
          setLecture(data[0])
        } else {
          setLecture(null)
        }
      } catch (error) {
        console.error("Error in fetchLecture:", error)
        setLecture(null)
      } finally {
        setLoading(false)
      }
    }

    const fetchDefaultContactUrl = async () => {
      try {
        const response = await fetch("/api/settings/default_contact_url")
        if (response.ok) {
          const data = await response.json()
          if (data.value) {
            setDefaultContactUrl(data.value)
          }
        }
      } catch (error) {
        console.error("Error fetching default contact URL:", error)
      }
    }

    fetchLecture()
    fetchDefaultContactUrl()
  }, [params.id])

  const handleBackClick = () => {
    router.push("/lectures")
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
      </div>
    )
  }

  if (!lecture) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl mb-4">강의를 찾을 수 없습니다</p>
          <p className="text-gray-500 mb-6">요청하신 강의가 존재하지 않거나 공개되지 않았습니다.</p>
          <Button onClick={handleBackClick}>강의 목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Button variant="ghost" className="mb-6" onClick={handleBackClick}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        강의 목록으로 돌아가기
      </Button>

      <div className="max-w-4xl mx-auto">
        <div className="relative w-full aspect-video mb-6">
          <Image
            src={lecture.thumbnail_url || "/placeholder.svg?height=400&width=800&query=lecture"}
            alt={lecture.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold">{lecture.title}</h1>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {lecture.instructor && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {lecture.instructor}
            </Badge>
          )}

          {lecture.category && (
            <Badge variant="outline" className="flex items-center gap-1">
              {lecture.category}
            </Badge>
          )}

          {lecture.duration && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {lecture.duration}분
            </Badge>
          )}

          {lecture.price && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />${lecture.price}
            </Badge>
          )}
        </div>

        {lecture.tags && lecture.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {lecture.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="mb-6" />

        <div className="prose max-w-none mb-8">
          <h2 className="text-2xl font-semibold mb-4">강의 소개</h2>
          <div className="whitespace-pre-wrap text-gray-700">{lecture.description || "강의 설명이 없습니다."}</div>
        </div>

        <div className="mb-8">
          <AskQuestionButton contactUrl={lecture.contact_url || defaultContactUrl} />
        </div>
      </div>
    </div>
  )
}
