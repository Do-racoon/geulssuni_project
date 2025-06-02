"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Users,
  BookOpen,
  FileText,
  MessageSquare,
  Activity,
  UserPlus,
  PenTool,
  BookPlus,
  GraduationCap,
} from "lucide-react"
import { getDashboardStats, getMonthlyActivityFallback, type DashboardStats } from "@/lib/api/dashboard"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export default function AdminOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()

    // 5분마다 자동 새로고침
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getDashboardStats()

      // 월별 활동 데이터가 없으면 폴백 사용
      if (!data.monthlyActivity.length) {
        data.monthlyActivity = await getMonthlyActivityFallback()
      }

      setStats(data)
    } catch (err) {
      console.error("Dashboard loading error:", err)
      setError("데이터를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "post_created":
        return <PenTool className="h-4 w-4 text-green-500" />
      case "lecture_created":
        return <GraduationCap className="h-4 w-4 text-purple-500" />
      case "book_created":
        return <BookPlus className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes}분 전`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}시간 전`
    } else {
      return `${Math.floor(diffInMinutes / 1440)}일 전`
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">데이터를 불러오는 중...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-red-500">{error}</p>
        </div>
        <button onClick={loadDashboardData} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          다시 시도
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">실시간 플랫폼 현황</p>
      </div>

      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSessions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">총 세션 수</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">도서 조회수</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalBookViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">전체 도서 조회수 합계</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">강의 조회수</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLectureViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">전체 강의 조회수 합계</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">게시글 조회수</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPostViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">전체 게시글 조회수 합계</p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Activity Chart */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>월별 활동 현황</CardTitle>
              <p className="text-sm text-muted-foreground">최근 30일간의 사용자 활동 및 조회수 추이</p>
            </CardHeader>
            <CardContent>
              {stats?.monthlyActivity.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.monthlyActivity}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString("ko-KR")}
                      formatter={(value, name) => [
                        value,
                        name === "users" ? "신규 사용자" : name === "posts" ? "새 게시글" : "조회수",
                      ]}
                    />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="users" />
                    <Line type="monotone" dataKey="posts" stroke="#82ca9d" strokeWidth={2} name="posts" />
                    <Line type="monotone" dataKey="views" stroke="#ffc658" strokeWidth={2} name="views" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  데이터가 없습니다
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>최근 활동</CardTitle>
            <p className="text-sm text-muted-foreground">회원가입, 게시글 작성, 콘텐츠 추가 등</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentActivity.length ? (
                stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">by {activity.user_name}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimeAgo(activity.created_at)}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">최근 활동이 없습니다</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
