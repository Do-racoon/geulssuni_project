import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ success: false, error: "URL이 제공되지 않았습니다." }, { status: 400 })
    }

    // URL이 접근 가능한지 확인
    const response = await fetch(url, { method: "HEAD" })

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
    })
  } catch (error) {
    console.error("비디오 URL 확인 중 오류:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "알 수 없는 오류" },
      { status: 500 },
    )
  }
}
