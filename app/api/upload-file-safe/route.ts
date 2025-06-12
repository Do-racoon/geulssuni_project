import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드에서 서비스 롤 키 사용
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// 더 작은 파일 크기 제한으로 시작
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB로 줄임

// Next.js App Router에서 파일 크기 제한 설정
export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log("📤 서버 사이드 파일 업로드 시작")

    // Content-Length 헤더 먼저 확인
    const contentLength = request.headers.get("content-length")
    console.log("📏 Content-Length:", contentLength)

    if (contentLength) {
      const size = Number.parseInt(contentLength)
      if (size > MAX_FILE_SIZE) {
        console.error("❌ 파일 크기가 너무 큼:", size, "최대:", MAX_FILE_SIZE)
        return NextResponse.json(
          {
            success: false,
            error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다. (요청 크기: ${(size / 1024 / 1024).toFixed(1)}MB)`,
          },
          { status: 413 },
        )
      }
    }

    // 환경 변수 먼저 확인
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ SUPABASE_SERVICE_ROLE_KEY 환경 변수가 없습니다.")
      return NextResponse.json(
        {
          success: false,
          error: "서버 설정 오류: 스토리지 접근 권한이 없습니다.",
        },
        { status: 500 },
      )
    }

    let formData: FormData
    try {
      console.log("📋 FormData 파싱 시작...")
      formData = await request.formData()
      console.log("✅ FormData 파싱 완료")
    } catch (error) {
      console.error("❌ FormData 파싱 오류:", error)
      return NextResponse.json(
        {
          success: false,
          error: "파일 데이터를 읽을 수 없습니다. 파일 크기가 너무 클 수 있습니다.",
        },
        { status: 400 },
      )
    }

    const file = formData.get("file") as File
    const bucketName = (formData.get("bucketName") as string) || "uploads"

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "파일이 없습니다.",
        },
        { status: 400 },
      )
    }

    console.log("📁 업로드할 파일:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // 파일 크기 다시 확인
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE / 1024 / 1024}MB까지 업로드 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`,
        },
        { status: 413 },
      )
    }

    // 파일 타입 확인
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ]

    const fileName = file.name.toLowerCase()
    const isAllowedType =
      allowedTypes.includes(file.type) ||
      fileName.endsWith(".mp4") ||
      fileName.endsWith(".webm") ||
      fileName.endsWith(".ogg") ||
      fileName.endsWith(".mov") ||
      fileName.endsWith(".jpg") ||
      fileName.endsWith(".jpeg") ||
      fileName.endsWith(".png") ||
      fileName.endsWith(".gif") ||
      fileName.endsWith(".webp")

    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: `지원하지 않는 파일 형식입니다. (${file.type || "알 수 없음"})`,
        },
        { status: 400 },
      )
    }

    // 버킷 존재 확인 및 생성
    console.log("🪣 버킷 상태 확인 중...")
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()

    if (listError) {
      console.error("❌ 버킷 목록 조회 오류:", listError)
      return NextResponse.json(
        {
          success: false,
          error: "스토리지 접근 오류",
        },
        { status: 500 },
      )
    }

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName)

    if (!bucketExists) {
      console.log(`🪣 '${bucketName}' 버킷 생성 중...`)
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: MAX_FILE_SIZE,
      })

      if (createError) {
        console.error("❌ 버킷 생성 오류:", createError)
        return NextResponse.json(
          {
            success: false,
            error: `버킷 생성 실패: ${createError.message}`,
          },
          { status: 500 },
        )
      }

      console.log(`✅ '${bucketName}' 버킷 생성 완료`)
    }

    // 파일 경로 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop() || ""
    const safeFileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `home/${safeFileName}`

    console.log("📤 업로드 경로:", filePath)

    // 파일을 ArrayBuffer로 변환
    let arrayBuffer: ArrayBuffer
    try {
      console.log("📖 파일 읽기 시작...")
      arrayBuffer = await file.arrayBuffer()
      console.log("✅ 파일 읽기 완료, 크기:", arrayBuffer.byteLength)
    } catch (error) {
      console.error("❌ 파일 읽기 오류:", error)
      return NextResponse.json(
        {
          success: false,
          error: "파일을 읽을 수 없습니다.",
        },
        { status: 400 },
      )
    }

    const fileBuffer = new Uint8Array(arrayBuffer)

    // Supabase Storage에 업로드
    console.log("📤 Supabase Storage 업로드 시작...")
    const { data, error } = await supabaseAdmin.storage.from(bucketName).upload(filePath, fileBuffer, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("❌ Supabase 업로드 오류:", error)
      return NextResponse.json(
        {
          success: false,
          error: `업로드 실패: ${error.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ Supabase 업로드 성공:", data)

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path)
    const publicUrl = urlData.publicUrl

    console.log("🔗 Public URL:", publicUrl)

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        publicUrl: publicUrl,
        fileName: safeFileName,
        originalName: file.name,
        size: file.size,
      },
    })
  } catch (error) {
    console.error("❌ 서버 업로드 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
