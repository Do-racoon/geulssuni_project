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
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-white border-2 border-black p-0 h-14 rounded-none">
          <TabsTrigger
            value="free"
            className="h-14 text-base font-light tracking-widest uppercase transition-all duration-200 rounded-none data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-black data-[state=inactive]:hover:bg-gray-100 border-r border-black last:border-r-0 focus:outline-none focus:ring-0 focus:ring-offset-0"
          >
            FREE BOARD
          </TabsTrigger>
          <TabsTrigger
            value="assignment"
            className="h-14 text-base font-light tracking-widest uppercase transition-all duration-200 rounded-none data-[state=active]:bg-black data-[state=active]:text-white data-[state=inactive]:text-black data-[state=inactive]:hover:bg-gray-100 focus:outline-none focus:ring-0 focus:ring-offset-0"
          >
            ASSIGNMENTS
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
