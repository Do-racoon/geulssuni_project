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

    try {
      // FormData 파싱
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
      const maxSize = 10 * 1024 * 1024 // 10MB
      if (file.size > maxSize) {
        console.error("❌ 파일 크기 초과:", file.size, "bytes, 최대:", maxSize, "bytes")
        return NextResponse.json(
          {
            success: false,
            error: `파일 크기가 너무 큽니다. 최대 ${Math.round(maxSize / 1024 / 1024)}MB까지 업로드 가능합니다.`,
          },
          { status: 413 }, // Payload Too Large
        )
      }

      // 파일 타입 검증
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "video/mp4",
        "video/webm",
        "video/ogg",
      ]
      if (!allowedTypes.includes(file.type)) {
        console.error("❌ 지원하지 않는 파일 타입:", file.type)
        return NextResponse.json(
          {
            success: false,
            error: `지원하지 않는 파일 형식입니다. 지원 형식: ${allowedTypes.join(", ")}`,
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

        // 구체적인 오류 타입에 따른 처리
        if (error.message.includes("Payload too large")) {
          return NextResponse.json(
            {
              success: false,
              error: "파일 크기가 너무 큽니다. 더 작은 파일을 선택해주세요.",
            },
            { status: 413 },
          )
        }

        if (error.message.includes("Invalid key")) {
          return NextResponse.json(
            {
              success: false,
              error: "파일명에 사용할 수 없는 문자가 포함되어 있습니다.",
            },
            { status: 400 },
          )
        }

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
    } catch (parseError) {
      console.error("❌ FormData 파싱 오류:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: "요청 데이터를 파싱할 수 없습니다.",
        },
        { status: 400 },
      )
    }
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
