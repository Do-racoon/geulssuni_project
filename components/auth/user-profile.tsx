"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Save, User, Mail, Shield, Users } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

interface UserData {
  id: string
  email: string
  name: string
  nickname: string | null
  role: string
  class_name: string | null
  is_active: boolean
  email_verified: boolean
  created_at: string
  updated_at: string
}

export default function UserProfile() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUser() {
      try {
        setIsLoading(true)

        // Get current user from auth
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          router.push("/login")
          return
        }

        setUser(authUser)

        // Get user data from database by email instead of ID
        const { data: dbUsers, error: dbError } = await supabase.from("users").select("*").eq("email", authUser.email)

        if (dbError) {
          console.error("Error fetching user data:", dbError)
          toast({
            title: "오류",
            description: "사용자 정보를 불러오는데 실패했습니다.",
            variant: "destructive",
          })
          return
        }

        if (!dbUsers || dbUsers.length === 0) {
          // 사용자가 DB에 없는 경우 기본 정보로 표시
          setUserData({
            id: authUser.id,
            email: authUser.email || "",
            name: authUser.user_metadata?.name || "사용자",
            nickname: null,
            role: "user",
            class_name: null,
            is_active: true,
            email_verified: authUser.email_confirmed_at ? true : false,
            created_at: authUser.created_at || new Date().toISOString(),
            updated_at: authUser.updated_at || new Date().toISOString(),
          })
        } else if (dbUsers.length === 1) {
          setUserData(dbUsers[0])
        } else {
          // 여러 사용자가 있는 경우 첫 번째 사용자 사용
          console.warn("Multiple users found with same email, using first one")
          setUserData(dbUsers[0])
        }
      } catch (error) {
        console.error("Error loading user:", error)
        toast({
          title: "오류",
          description: "사용자 정보를 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [router, supabase, toast])

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "오류",
        description: "새 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      })
      return
    }

    setIsUpdatingPassword(true)

    try {
      // Update password in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      })

      if (error) {
        throw error
      }

      toast({
        title: "성공",
        description: "비밀번호가 성공적으로 변경되었습니다.",
      })

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsChangingPassword(false)
    } catch (error: any) {
      console.error("Error updating password:", error)
      toast({
        title: "오류",
        description: error.message || "비밀번호 변경에 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin":
        return "관리자"
      case "instructor":
        return "강사"
      case "user":
        return "학생"
      default:
        return "사용자"
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !userData) {
    return (
      <div className="text-center py-8">
        <p>사용자 정보를 불러올 수 없습니다.</p>
        <Button onClick={() => router.push("/login")} className="mt-4">
          로그인 페이지로 이동
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* 사용자 정보 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            회원 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                이메일
              </Label>
              <Input value={userData.email} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label>이름</Label>
              <Input value={userData.name} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                역할
              </Label>
              <Input value={getRoleDisplayName(userData.role)} disabled className="bg-gray-50" />
            </div>

            <div>
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4" />반
              </Label>
              <Input value={userData.class_name || "미설정"} disabled className="bg-gray-50" />
            </div>
          </div>

          <div className="text-sm text-gray-500 pt-4 border-t">
            <p>가입일: {new Date(userData.created_at).toLocaleDateString("ko-KR")}</p>
            <p>최종 수정일: {new Date(userData.updated_at).toLocaleDateString("ko-KR")}</p>
          </div>
        </CardContent>
      </Card>

      {/* 비밀번호 변경 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>비밀번호 변경</CardTitle>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>비밀번호 변경</Button>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="새 비밀번호를 입력하세요"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="새 비밀번호를 다시 입력하세요"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isUpdatingPassword}>
                  {isUpdatingPassword ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      변경 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      비밀번호 변경
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false)
                    setPasswordForm({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    })
                  }}
                >
                  취소
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* 계정 관리 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>계정 관리</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            로그아웃
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
