"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FreeBoardManagement from "@/components/board/free-board"
import AssignmentBoard from "@/components/board/assignment-board"
import { createSupabaseClient } from "@/lib/supabase/client"

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState("free")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  const checkAuth = useCallback(async () => {
    if (hasCheckedAuth) return

    setIsLoading(true)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        setUser(null)
        return
      }

      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, role, class_level, is_active")
        .eq("id", session.user.id)
        .single()

      if (profileError || !userProfile?.is_active) {
        setUser(null)
        return
      }

      const userData = {
        id: userProfile.id,
        name: userProfile.name,
        email: userProfile.email,
        role: userProfile.role,
        class_level: userProfile.class_level,
      }

      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
      setHasCheckedAuth(true)
    }
  }, [hasCheckedAuth])

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const freeBoardComponent = useMemo(() => <FreeBoardManagement />, [])
  const assignmentBoardComponent = useMemo(() => <AssignmentBoard />, [])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto py-24 px-4">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-4 text-gray-500 tracking-wider font-light">Loading board...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light tracking-widest uppercase">Board</h1>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border-b border-black rounded-none">
            <TabsTrigger
              value="free"
              className="tracking-wider font-light data-[state=active]:bg-black data-[state=active]:text-white rounded-none"
            >
              FREE BOARD
            </TabsTrigger>
            <TabsTrigger
              value="assignment"
              className="tracking-wider font-light data-[state=active]:bg-black data-[state=active]:text-white rounded-none"
            >
              ASSIGNMENT BOARD
            </TabsTrigger>
          </TabsList>

          <TabsContent value="free" className="mt-8">
            {freeBoardComponent}
          </TabsContent>

          <TabsContent value="assignment" className="mt-8">
            {assignmentBoardComponent}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
