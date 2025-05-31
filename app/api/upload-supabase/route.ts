import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    // 서버에서만 실행되므로 환경 변수 접근 가능
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables:", {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      })
      return NextResponse.json({ success: false, error: "Supabase configuration is incomplete" }, { status: 500 })
    }

    // 관리자 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = (formData.get("bucket") as string) || "uploads"
    const folder = (formData.get("folder") as string) || "books"

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // 파일 검증 - 이미지, 비디오, 문서 파일 허용
    const allowedTypes = [
      "image/",
      "video/", // 비디오 파일 추가
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "application/vnd.hancom.hwp",
    ]

    const isAllowedType = allowedTypes.some((type) => file.type.startsWith(type))

    if (!isAllowedType) {
      return NextResponse.json(
        {
          success: false,
          error: "Only image, video and document files are allowed",
        },
        { status: 400 },
      )
    }

    // 파일 크기 제한 - 비디오는 더 큰 용량 허용
    const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024 // 비디오: 100MB, 기타: 10MB

    if (file.size > maxSize) {
      const maxSizeMB = file.type.startsWith("video/") ? "100MB" : "10MB"
      return NextResponse.json(
        {
          success: false,
          error: `File size must be less than ${maxSizeMB}`,
        },
        { status: 400 },
      )
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // 버킷 존재 확인 및 생성
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.id === bucket)

    if (!bucketExists) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: [
          "image/*",
          "video/*", // 비디오 MIME 타입 추가
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/vnd.hancom.hwp",
        ],
        fileSizeLimit: 104857600, // 100MB
      })

      if (bucketError && !bucketError.message.includes("already exists")) {
        console.error("Bucket creation error:", bucketError)
        return NextResponse.json({ success: false, error: "Failed to create storage bucket" }, { status: 500 })
      }
    }

    // 파일 업로드
    const { data, error } = await supabaseAdmin.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("Upload error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from(bucket).getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl, // 클라이언트에서 기대하는 'url' 필드 추가
      data: {
        path: data.path,
        publicUrl,
        fileName,
      },
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 },
    )
  }
}
