"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Eye, Check, X, Clock } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Report {
  id: string
  post_id: string
  user_id: string
  reason: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  created_at: string
  post?: {
    id: string
    title: string
    author_id: string
  }
  reporter?: {
    id: string
    name: string
  }
}

export default function ReportsManagement() {
  const [reports, setReports] = useState<Report[]>([])
  const [activeTab, setActiveTab] = useState("pending")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchReports(activeTab)
  }, [activeTab])

  const fetchReports = async (status: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports?status=${status}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports || [])
      } else {
        toast({
          title: "오류",
          description: "신고 목록을 불러오는데 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
      toast({
        title: "오류",
        description: "신고 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        toast({
          title: "성공",
          description: "신고 상태가 업데이트되었습니다.",
        })
        fetchReports(activeTab)
      } else {
        toast({
          title: "오류",
          description: "상태 업데이트에 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "오류",
        description: "상태 업데이트에 실패했습니다.",
        variant: "destructive",
      })
    }
  }

  const viewPost = (postId: string) => {
    window.open(`/board/${postId}`, "_blank")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            대기중
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            <Eye className="w-3 h-3 mr-1" />
            검토됨
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Check className="w-3 h-3 mr-1" />
            해결됨
          </Badge>
        )
      case "dismissed":
        return (
          <Badge variant="outline" className="text-gray-600 border-gray-600">
            <X className="w-3 h-3 mr-1" />
            기각됨
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">신고 관리</h1>
          <p className="text-gray-500">사용자 신고를 관리합니다</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-2">신고 관리</h1>
          <p className="text-gray-500">사용자 신고를 관리합니다</p>
        </div>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <span className="text-sm text-gray-600">총 {reports.length}건</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="reviewed">검토됨</TabsTrigger>
          <TabsTrigger value="resolved">해결됨</TabsTrigger>
          <TabsTrigger value="dismissed">기각됨</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">신고가 없습니다</h3>
                <p className="text-gray-500">현재 {activeTab} 상태의 신고가 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <Card key={report.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{report.post?.title || "제목 없음"}</CardTitle>
                        <CardDescription>
                          신고자: {report.reporter?.name || "알 수 없음"} • {formatDate(report.created_at)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-700 mb-1">신고 사유</h4>
                        <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{report.reason}</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => viewPost(report.post_id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          게시글 보기
                        </Button>

                        {report.status === "pending" && (
                          <>
                            <Button
                              onClick={() => updateReportStatus(report.id, "reviewed")}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 border-blue-600 hover:bg-blue-50"
                            >
                              검토 완료
                            </Button>
                            <Button
                              onClick={() => updateReportStatus(report.id, "resolved")}
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              해결됨
                            </Button>
                            <Button
                              onClick={() => updateReportStatus(report.id, "dismissed")}
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                            >
                              기각
                            </Button>
                          </>
                        )}

                        {report.status === "reviewed" && (
                          <>
                            <Button
                              onClick={() => updateReportStatus(report.id, "resolved")}
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              해결됨
                            </Button>
                            <Button
                              onClick={() => updateReportStatus(report.id, "dismissed")}
                              variant="outline"
                              size="sm"
                              className="text-gray-600 border-gray-600 hover:bg-gray-50"
                            >
                              기각
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
