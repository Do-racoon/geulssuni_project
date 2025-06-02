import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드 Supabase 클라이언트 생성
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    console.log("📤 Upload API 호출됨")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = (formData.get("bucket") as string) || "uploads"
    const folder = (formData.get("folder") as string) || ""

    console.log("📤 업로드 파라미터:", {
      fileName: file?.name,
      fileSize: file?.size,
      bucket,
      folder,
    })

    if (!file) {
      console.error("❌ 파일이 없습니다")
      return NextResponse.json(
        {
          success: false,
          error: "파일이 선택되지 않았습니다",
        },
        { status: 400 },
      )
    }

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      console.error("❌ 파일 크기 초과:", file.size)
      return NextResponse.json(
        {
          success: false,
          error: "파일 크기는 10MB 이하여야 합니다",
        },
        { status: 400 },
      )
    }

    // 파일 경로 생성 - 더 고유한 이름 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop() || ""
    const safeFileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = folder ? `${folder}/${safeFileName}` : safeFileName

    console.log("📤 업로드 경로:", filePath)

    // 기존 파일 존재 여부 확인
    const { data: existingFile } = await supabase.storage.from(bucket).list(folder || "", {
      search: safeFileName,
    })

    if (existingFile && existingFile.length > 0) {
      console.warn("⚠️ 동일한 파일명이 이미 존재합니다:", safeFileName)
      // 새로운 파일명 생성
      const newRandomString = Math.random().toString(36).substring(2, 15)
      const newFileName = `${timestamp}_${newRandomString}.${fileExtension}`
      const newFilePath = folder ? `${folder}/${newFileName}` : newFileName
      console.log("📤 새로운 업로드 경로:", newFilePath)
    }

    // Supabase Storage에 업로드 - upsert를 false로 설정하여 덮어쓰기 방지
    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false, // 덮어쓰기 방지
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

    // Public URL 생성
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`

    console.log("✅ 업로드 성공:", { path: data.path, publicUrl })

    return NextResponse.json({
      success: true,
      data: {
        path: data.path,
        publicUrl,
        fileName: file.name,
      },
    })
  } catch (error) {
    console.error("❌ Upload API 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
