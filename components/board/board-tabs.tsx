"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FreeBoard } from "@/components/board/free-board"
import AssignmentBoard from "@/components/board/assignment-board"

interface BoardTabsProps {
  defaultTab: string
}

export default function BoardTabs({ defaultTab = "free" }: BoardTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <Tabs defaultValue={defaultTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="free" className="text-sm uppercase tracking-wider py-3">
          Free Board
        </TabsTrigger>
        <TabsTrigger value="assignment" className="text-sm uppercase tracking-wider py-3">
          Assignment Board
        </TabsTrigger>
      </TabsList>
      <TabsContent value="free">
        <FreeBoard />
      </TabsContent>
      <TabsContent value="assignment">
        <AssignmentBoard />
      </TabsContent>
    </Tabs>
  )
}
