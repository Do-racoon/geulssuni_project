import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 필요한 MIME 타입 목록
const REQUIRED_MIME_TYPES = [
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

// 서버 사이드 Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    console.log("🪣 버킷 생성/업데이트 API 호출됨")

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

    console.log(`🪣 '${bucketName}' 버킷 생성/업데이트 시도...`)

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

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (bucketExists) {
      console.log(`✅ '${bucketName}' 버킷이 이미 존재합니다. 설정 확인 중...`)

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

      // MIME 타입 확인
      const allowedMimeTypes = bucketDetails.allowed_mime_types || []

      // 누락된 MIME 타입 확인
      const missingMimeTypes = REQUIRED_MIME_TYPES.filter((type) => !allowedMimeTypes.includes(type))

      if (missingMimeTypes.length === 0) {
        console.log(`✅ '${bucketName}' 버킷에 필요한 모든 MIME 타입이 이미 설정되어 있습니다.`)
        return NextResponse.json({
          success: true,
          message: `'${bucketName}' 버킷에 필요한 모든 MIME 타입이 이미 설정되어 있습니다.`,
          data: {
            bucketName,
            allowedMimeTypes,
          },
        })
      }

      console.log(`⚠️ '${bucketName}' 버킷에 누락된 MIME 타입이 있습니다:`, missingMimeTypes)

      // 버킷 설정 업데이트
      const { error: updateError } = await supabaseAdmin.storage.updateBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: REQUIRED_MIME_TYPES,
      })

      if (updateError) {
        console.error("❌ 버킷 설정 업데이트 오류:", updateError)
        return NextResponse.json(
          {
            success: false,
            error: "버킷 설정을 업데이트할 수 없습니다.",
            details: updateError,
          },
          { status: 500 },
        )
      }

      console.log(`✅ '${bucketName}' 버킷 설정이 업데이트되었습니다.`)
      return NextResponse.json({
        success: true,
        message: `'${bucketName}' 버킷 설정이 업데이트되었습니다.`,
        data: {
          bucketName,
          updatedMimeTypes: REQUIRED_MIME_TYPES,
        },
      })
    }

    // 버킷이 존재하지 않으면 새로 생성
    console.log(`🆕 '${bucketName}' 버킷이 존재하지 않습니다. 새로 생성합니다.`)

    // 버킷 생성
    const { data, error } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: REQUIRED_MIME_TYPES,
    })

    if (error) {
      console.error("❌ 버킷 생성 오류:", error)
      return NextResponse.json(
        {
          success: false,
          error: `'${bucketName}' 버킷을 생성할 수 없습니다.`,
          details: error,
        },
        { status: 500 },
      )
    }

    console.log(`✅ '${bucketName}' 버킷 생성 성공:`, data)

    return NextResponse.json({
      success: true,
      message: `'${bucketName}' 버킷이 성공적으로 생성되었습니다.`,
      data: {
        bucketName,
        allowedMimeTypes: REQUIRED_MIME_TYPES,
      },
    })
  } catch (error) {
    console.error("❌ 버킷 생성/업데이트 API 전체 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
