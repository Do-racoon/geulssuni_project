import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드 Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    console.log("🔍 버킷 설정 확인 API 호출됨")

    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Supabase 환경 변수가 설정되지 않았습니다")
      return NextResponse.json(
        {
          success: false,
          error: "Supabase 환경 변수가 설정되지 않았습니다.",
        },
        { status: 500 },
      )
    }

    // 요청 본문 파싱
    const body = await request.json()
    const { bucketName } = body

    if (!bucketName) {
      return NextResponse.json(
        {
          success: false,
          error: "버킷 이름이 제공되지 않았습니다.",
        },
        { status: 400 },
      )
    }

    console.log(`🔍 '${bucketName}' 버킷 설정 확인 중...`)

    // 버킷 존재 여부 확인
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("❌ 버킷 목록 조회 오류:", listError)
      return NextResponse.json(
        {
          success: false,
          error: "버킷 목록을 조회할 수 없습니다.",
          details: listError,
        },
        { status: 500 },
      )
    }

    const bucket = buckets?.find((b) => b.name === bucketName)

    if (!bucket) {
      console.log(`❌ '${bucketName}' 버킷이 존재하지 않습니다.`)
      return NextResponse.json(
        {
          success: false,
          error: `'${bucketName}' 버킷이 존재하지 않습니다.`,
          exists: false,
        },
        { status: 404 },
      )
    }

    // 버킷 설정 가져오기
    const { data: bucketDetails, error: bucketError } = await supabaseAdmin.storage.getBucket(bucketName)

    if (bucketError) {
      console.error("❌ 버킷 설정 조회 오류:", bucketError)
      return NextResponse.json(
        {
          success: false,
          error: "버킷 설정을 조회할 수 없습니다.",
          details: bucketError,
        },
        { status: 500 },
      )
    }

    console.log(`✅ '${bucketName}' 버킷 설정 확인 완료:`, bucketDetails)

    // MIME 타입 확인
    const allowedMimeTypes = bucketDetails.allowed_mime_types || []
    const hasVideoMp4 = allowedMimeTypes.includes("video/mp4")
    const hasImageJpeg = allowedMimeTypes.includes("image/jpeg")
    const hasImagePng = allowedMimeTypes.includes("image/png")

    // 필요한 MIME 타입 목록
    const requiredMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
    ]

    // 누락된 MIME 타입 확인
    const missingMimeTypes = requiredMimeTypes.filter((type) => !allowedMimeTypes.includes(type))

    return NextResponse.json({
      success: true,
      data: {
        bucketDetails,
        allowedMimeTypes,
        hasVideoMp4,
        hasImageJpeg,
        hasImagePng,
        missingMimeTypes,
        needsUpdate: missingMimeTypes.length > 0,
      },
      message: `'${bucketName}' 버킷 설정 확인 완료`,
    })
  } catch (error) {
    console.error("❌ 버킷 설정 확인 API 전체 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
