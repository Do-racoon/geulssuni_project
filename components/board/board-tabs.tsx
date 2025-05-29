"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FreeBoard from "./free-board"
import AssignmentBoard from "./assignment-board"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth"

export default function BoardTabs() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tab = searchParams.get("tab") || "free"
  const [activeTab, setActiveTab] = useState(tab)
  const { user } = useAuth()

  useEffect(() => {
    setActiveTab(tab)
  }, [tab])

  const handleTabChange = (value: string) => {
    router.push(`/board?tab=${value}`)
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="mb-8">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 p-1 rounded-xl h-14">
          <TabsTrigger
            value="free"
            className="rounded-lg h-12 text-base font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
          >
            📝 자유게시판
          </TabsTrigger>
          <TabsTrigger
            value="assignment"
            className="rounded-lg h-12 text-base font-medium transition-all duration-200 data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-gray-900"
          >
            📋 과제게시판
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="free" className="mt-0">
        <FreeBoard />
      </TabsContent>
      <TabsContent value="assignment" className="mt-0">
        <AssignmentBoard />
      </TabsContent>
    </Tabs>
  )
}
