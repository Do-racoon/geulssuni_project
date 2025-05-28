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
    const folder = (formData.get("folder") as string) || ""

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // 파일 검증 - 이미지와 문서 파일 허용
    const allowedTypes = [
      "image/",
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
          error: "Only image and document files are allowed",
        },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: "File size must be less than 10MB",
        },
        { status: 400 },
      )
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${folder ? "/" : ""}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // 버킷 존재 확인 및 생성
    const { data: buckets } = await supabaseAdmin.storage.listBuckets()
    const bucketExists = buckets?.some((b) => b.id === bucket)

    if (!bucketExists) {
      const { error: bucketError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: true,
        allowedMimeTypes: [
          "image/*",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "text/plain",
          "application/vnd.hancom.hwp",
        ],
        fileSizeLimit: 10485760, // 10MB
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
