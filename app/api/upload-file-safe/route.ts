import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

// 서버 사이드 Supabase 클라이언트 생성 (서비스 롤 키 사용)
const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: Request) {
  try {
    console.log("📤 서버 측 파일 업로드 API 호출됨")

    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("❌ Supabase 환경 변수가 설정되지 않았습니다")
      return NextResponse.json(
        {
          success: false,
          error: "서버 설정 오류: Supabase 환경 변수가 설정되지 않았습니다.",
        },
        { status: 500 },
      )
    }

    // FormData 파싱
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucketName = (formData.get("bucketName") as string) || "uploads"
    const folder = (formData.get("folder") as string) || "home"

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: "파일이 제공되지 않았습니다.",
        },
        { status: 400 },
      )
    }

    console.log("📤 업로드 요청 정보:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      bucketName,
      folder,
    })

    // 파일 크기 제한 확인
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        },
        { status: 400 },
      )
    }

    // 파일 타입 확인
    const allowedTypes = [
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

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `지원하지 않는 파일 형식입니다: ${file.type}`,
        },
        { status: 400 },
      )
    }

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

    if (!bucketExists) {
      console.log(`🆕 '${bucketName}' 버킷이 존재하지 않습니다. 새로 생성합니다.`)

      // 버킷 생성
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: allowedTypes,
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

      console.log(`✅ '${bucketName}' 버킷 생성 성공`)
    } else {
      console.log(`✅ '${bucketName}' 버킷이 이미 존재합니다.`)
    }

    // 파일 경로 생성
    const timestamp = Date.now()
    const randomString = uuidv4().substring(0, 8)
    const fileExtension = file.name.split(".").pop() || ""
    const safeFileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = `${folder}/${safeFileName}`

    console.log("📤 업로드 경로:", filePath)

    // 파일 데이터 가져오기
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Supabase Storage에 업로드 (서비스 롤 키 사용)
    const { data, error } = await supabaseAdmin.storage.from(bucketName).upload(filePath, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("❌ 파일 업로드 오류:", error)
      return NextResponse.json(
        {
          success: false,
          error: `파일 업로드 실패: ${error.message}`,
        },
        { status: 500 },
      )
    }

    console.log("✅ 파일 업로드 성공:", data)

    // Public URL 생성
    const { data: urlData } = supabaseAdmin.storage.from(bucketName).getPublicUrl(data.path)
    const publicUrl = urlData.publicUrl

    console.log("🔗 Public URL:", publicUrl)

    return NextResponse.json({
      success: true,
      message: "파일이 성공적으로 업로드되었습니다.",
      data: {
        path: data.path,
        publicUrl,
        fileName: safeFileName,
        originalName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    })
  } catch (error) {
    console.error("❌ 서버 측 파일 업로드 API 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}

// 파일 크기 제한 설정
export const config = {
  api: {
    bodyParser: false,
  },
}
