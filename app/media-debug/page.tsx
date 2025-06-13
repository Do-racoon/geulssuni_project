"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export default function MediaDebugPage() {
  const [videoUrl, setVideoUrl] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [videoStatus, setVideoStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [imageStatus, setImageStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [apiResponse, setApiResponse] = useState<any>(null)

  const testVideo = async () => {
    if (!videoUrl) return

    setVideoStatus("loading")
    setErrorMessage("")
    setApiResponse(null)

    try {
      // API를 통해 URL 확인
      const response = await fetch("/api/check-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: videoUrl }),
      })

      const data = await response.json()
      setApiResponse(data)

      if (data.success) {
        // API 확인 성공, 실제 비디오 로드 테스트
        const video = document.createElement("video")

        const loadPromise = new Promise<void>((resolve, reject) => {
          video.onloadeddata = () => resolve()
          video.onerror = (e) => reject(new Error("비디오 로드 실패"))

          // 10초 타임아웃
          setTimeout(() => reject(new Error("비디오 로드 타임아웃")), 10000)
        })

        video.src = videoUrl

        try {
          await loadPromise
          setVideoStatus("success")
        } catch (error) {
          setVideoStatus("error")
          setErrorMessage(error instanceof Error ? error.message : "비디오 로드 실패")
        }
      } else {
        setVideoStatus("error")
        setErrorMessage(data.error || "URL에 접근할 수 없습니다")
      }
    } catch (error) {
      setVideoStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류")
    }
  }

  const testImage = () => {
    if (!imageUrl) return

    setImageStatus("loading")
    setErrorMessage("")

    const img = new Image()
    img.onload = () => {
      setImageStatus("success")
    }
    img.onerror = () => {
      setImageStatus("error")
      setErrorMessage("이미지 로드 실패")
    }
    img.src = imageUrl
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">미디어 디버그 페이지</h1>

      <Tabs defaultValue="video">
        <TabsList>
          <TabsTrigger value="video">비디오 테스트</TabsTrigger>
          <TabsTrigger value="image">이미지 테스트</TabsTrigger>
        </TabsList>

        <TabsContent value="video" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>비디오 URL 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="비디오 URL 입력" />
                  <Button onClick={testVideo} disabled={videoStatus === "loading"}>
                    {videoStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        테스트 중
                      </>
                    ) : (
                      "테스트"
                    )}
                  </Button>
                </div>

                {videoStatus === "success" && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <AlertDescription>비디오 URL이 유효합니다!</AlertDescription>
                  </Alert>
                )}

                {videoStatus === "error" && (
                  <Alert className="bg-red-50 border-red-200 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <AlertDescription>{errorMessage || "비디오 URL이 유효하지 않습니다."}</AlertDescription>
                  </Alert>
                )}

                {apiResponse && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm">
                    <h3 className="font-medium mb-2">API 응답:</h3>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(apiResponse, null, 2)}</pre>
                  </div>
                )}

                {videoStatus === "success" && (
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-full object-contain"
                      onError={() => {
                        setVideoStatus("error")
                        setErrorMessage("비디오 재생 중 오류가 발생했습니다.")
                      }}
                    />
                  </div>
                )}

                <div className="mt-4">
                  <h3 className="font-medium mb-2">비디오 디버깅 팁:</h3>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>URL이 공개적으로 접근 가능한지 확인하세요.</li>
                    <li>Supabase Storage를 사용하는 경우, 버킷이 public으로 설정되어 있는지 확인하세요.</li>
                    <li>CORS 설정이 올바른지 확인하세요.</li>
                    <li>비디오 파일 형식이 MP4인지 확인하세요.</li>
                    <li>비디오 파일 크기가 너무 크지 않은지 확인하세요.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>이미지 URL 테스트</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="이미지 URL 입력" />
                  <Button onClick={testImage} disabled={imageStatus === "loading"}>
                    {imageStatus === "loading" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        테스트 중
                      </>
                    ) : (
                      "테스트"
                    )}
                  </Button>
                </div>

                {imageStatus === "success" && (
                  <Alert className="bg-green-50 border-green-200 mb-4">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <AlertDescription>이미지 URL이 유효합니다!</AlertDescription>
                  </Alert>
                )}

                {imageStatus === "error" && (
                  <Alert className="bg-red-50 border-red-200 mb-4">
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                    <AlertDescription>{errorMessage || "이미지 URL이 유효하지 않습니다."}</AlertDescription>
                  </Alert>
                )}

                {imageStatus === "success" && (
                  <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={imageUrl || "/placeholder.svg"}
                      alt="테스트 이미지"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
