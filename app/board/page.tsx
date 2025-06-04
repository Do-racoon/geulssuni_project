"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FreeBoardManagement from "@/components/board/free-board"
import AssignmentBoard from "@/components/board/assignment-board"
import { createSupabaseClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function BoardPage() {
  const [activeTab, setActiveTab] = useState("free")
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  console.log(`[BoardPage] Component mounted, activeTab: ${activeTab}`)

  // 사용자 인증 확인 함수를 useCallback으로 메모이제이션
  const checkAuth = useCallback(async () => {
    if (hasCheckedAuth) {
      console.log(`[BoardPage] Auth already checked`)
      return
    }

    console.log(`[BoardPage] Checking authentication`)
    setIsLoading(true)

    try {
      const supabase = createSupabaseClient()
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error(`[BoardPage] Session error:`, sessionError)
        setUser(null)
        return
      }

      if (!session?.user) {
        console.log(`[BoardPage] No session found`)
        setUser(null)
        return
      }

      // 사용자 프로필 조회
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, name, email, role, class_level, is_active")
        .eq("id", session.user.id)
        .single()

      if (profileError || !userProfile?.is_active) {
        console.log(`[BoardPage] User profile not found or inactive`)
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

      console.log(`[BoardPage] User authenticated:`, userData.name)
      setUser(userData)
    } catch (error) {
      console.error(`[BoardPage] Error checking auth:`, error)
      setUser(null)
    } finally {
      setIsLoading(false)
      setHasCheckedAuth(true)
    }
  }, [hasCheckedAuth])

  // 탭 변경 핸들러를 useCallback으로 메모이제이션
  const handleTabChange = useCallback(
    (value: string) => {
      console.log(`[BoardPage] Tab changed from ${activeTab} to ${value}`)
      setActiveTab(value)
    },
    [activeTab],
  )

  // 컴포넌트 마운트 시 인증 확인 (한 번만)
  useEffect(() => {
    console.log(`[BoardPage] useEffect triggered, hasChecked: ${hasCheckedAuth}`)
    checkAuth()
  }, [checkAuth])

  // 메모이제이션된 컴포넌트들
  const freeBoardComponent = useMemo(() => {
    console.log(`[BoardPage] Rendering FreeBoardManagement`)
    return <FreeBoardManagement />
  }, [])

  const assignmentBoardComponent = useMemo(() => {
    console.log(`[BoardPage] Rendering AssignmentBoard`)
    return <AssignmentBoard />
  }, [])

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
          {user && (
            <div className="flex space-x-4">
              <Link href="/board/create">
                <Button className="bg-black text-white hover:bg-gray-800 tracking-wider font-light rounded-none">
                  <Plus className="h-4 w-4 mr-2" />
                  NEW POST
                </Button>
              </Link>
              <Link href="/board/assignment/create">
                <Button
                  variant="outline"
                  className="border-black text-black hover:bg-black hover:text-white tracking-wider font-light rounded-none"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  NEW ASSIGNMENT
                </Button>
              </Link>
            </div>
          )}
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
