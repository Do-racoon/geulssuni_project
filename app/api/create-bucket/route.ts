import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드 Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    console.log("🪣 버킷 생성 API 호출됨")

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

    console.log(`🪣 '${bucketName}' 버킷 생성 시도...`)

    // 버킷 존재 여부 확인
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()

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
      console.log(`✅ '${bucketName}' 버킷이 이미 존재합니다.`)
      return NextResponse.json({
        success: true,
        message: `'${bucketName}' 버킷이 이미 존재합니다.`,
        bucketName,
      })
    }

    // 버킷 생성
    const { data, error } = await supabase.storage.createBucket(bucketName, {
      public: true, // 공개 버킷으로 설정
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
      data,
      bucketName,
    })
  } catch (error) {
    console.error("❌ 버킷 생성 API 전체 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
