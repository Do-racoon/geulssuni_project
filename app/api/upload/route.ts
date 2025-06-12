import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드 Supabase 클라이언트 생성
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// 파일 크기 제한 (파일 타입별로 다르게 적용)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

// 기본 버킷 이름
const DEFAULT_BUCKET = "uploads"

// 파일 타입별 최대 크기 반환
const getMaxFileSize = (file: File): number => {
  const fileName = file.name.toLowerCase()
  const fileType = file.type.toLowerCase()

  // 비디오 파일 확인
  if (
    fileType.startsWith("video/") ||
    fileName.endsWith(".mp4") ||
    fileName.endsWith(".webm") ||
    fileName.endsWith(".ogg") ||
    fileName.endsWith(".mov") ||
    fileName.endsWith(".avi") ||
    fileName.endsWith(".mkv")
  ) {
    return MAX_VIDEO_SIZE
  }

  // 이미지 파일 확인
  if (
    fileType.startsWith("image/") ||
    fileName.endsWith(".jpg") ||
    fileName.endsWith(".jpeg") ||
    fileName.endsWith(".png") ||
    fileName.endsWith(".gif") ||
    fileName.endsWith(".webp") ||
    fileName.endsWith(".svg")
  ) {
    return MAX_IMAGE_SIZE
  }

  // 기타 파일은 이미지 크기 제한 적용
  return MAX_IMAGE_SIZE
}

export async function POST(request: NextRequest) {
  try {
    console.log("📤 Upload API 호출됨")

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

    // FormData 파싱 시도
    let formData: FormData
    try {
      formData = await request.formData()
      console.log("✅ FormData 파싱 성공")
    } catch (parseError) {
      console.error("❌ FormData 파싱 실패:", parseError)
      return NextResponse.json(
        {
          success: false,
          error: `FormData 파싱 실패: ${parseError instanceof Error ? parseError.message : "알 수 없는 오류"}`,
        },
        { status: 400 },
      )
    }

    // FormData 내용 확인
    const formDataEntries: Record<string, any> = {}
    for (const [key, value] of formData.entries()) {
      formDataEntries[key] = value instanceof File ? `File(${value.name}, ${value.size} bytes, ${value.type})` : value
    }
    console.log("📋 FormData 내용:", formDataEntries)

    // 파일 및 옵션 추출
    const file = formData.get("file") as File | null
    const bucket = (formData.get("bucket") as string) || DEFAULT_BUCKET
    // 기본 폴더를 'home'으로 설정
    const folder = (formData.get("folder") as string) || "home"

    console.log("📤 업로드 파라미터:", {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type,
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

    // 파일 타입별 크기 검증
    const maxFileSize = getMaxFileSize(file)
    const isVideo = maxFileSize === MAX_VIDEO_SIZE

    if (file.size > maxFileSize) {
      const fileType = isVideo ? "영상" : "이미지"
      const maxSizeMB = Math.round(maxFileSize / 1024 / 1024)
      const currentSizeMB = (file.size / 1024 / 1024).toFixed(1)

      console.error("❌ 파일 크기 초과:", file.size, "bytes, 최대:", maxFileSize, "bytes")
      return NextResponse.json(
        {
          success: false,
          error: `${fileType} 파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다. (현재: ${currentSizeMB}MB)`,
          details: {
            fileSize: file.size,
            maxSize: maxFileSize,
            fileSizeMB: Number.parseFloat(currentSizeMB),
            maxSizeMB: maxSizeMB,
            fileType: fileType,
          },
        },
        { status: 413 },
      )
    }

    // 버킷 존재 여부 확인 및 생성
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

      if (bucketsError) {
        console.error("❌ 버킷 목록 조회 오류:", bucketsError)
        return NextResponse.json(
          {
            success: false,
            error: "스토리지 버킷에 접근할 수 없습니다.",
            details: bucketsError,
          },
          { status: 500 },
        )
      }

      const bucketExists = buckets?.some((b) => b.name === bucket)

      // 버킷이 없으면 생성
      if (!bucketExists) {
        console.log(`⚠️ '${bucket}' 버킷이 존재하지 않습니다. 생성을 시도합니다...`)

        const { data: newBucket, error: createError } = await supabase.storage.createBucket(bucket, {
          public: true, // 공개 버킷으로 설정
        })

        if (createError) {
          console.error("❌ 버킷 생성 오류:", createError)
          return NextResponse.json(
            {
              success: false,
              error: `'${bucket}' 버킷을 생성할 수 없습니다.`,
              details: createError,
            },
            { status: 500 },
          )
        }

        console.log(`✅ '${bucket}' 버킷 생성 성공:`, newBucket)
      } else {
        console.log(`✅ '${bucket}' 버킷 존재 확인 완료`)
      }
    } catch (bucketError) {
      console.error("❌ 버킷 확인/생성 중 오류:", bucketError)
      return NextResponse.json(
        {
          success: false,
          error: "버킷 확인/생성 중 오류가 발생했습니다.",
          details: bucketError instanceof Error ? bucketError.message : "알 수 없는 오류",
        },
        { status: 500 },
      )
    }

    // 파일 타입이 비어있거나 알 수 없는 경우 파일 확장자로 추측
    let fileType = file.type
    if (!fileType || fileType === "application/octet-stream") {
      const extension = file.name.split(".").pop()?.toLowerCase()
      if (extension === "mp4") fileType = "video/mp4"
      else if (extension === "webm") fileType = "video/webm"
      else if (extension === "ogg") fileType = "video/ogg"
      else if (extension === "mov") fileType = "video/quicktime"
      else if (extension === "avi") fileType = "video/x-msvideo"
      else if (extension === "mkv") fileType = "video/x-matroska"
      else if (extension === "jpg" || extension === "jpeg") fileType = "image/jpeg"
      else if (extension === "png") fileType = "image/png"
      else if (extension === "gif") fileType = "image/gif"
      else if (extension === "webp") fileType = "image/webp"
      console.log(`📋 파일 타입 추측: ${fileType} (확장자: ${extension})`)
    }

    // 파일 경로 생성 - 더 고유한 이름 생성
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split(".").pop() || ""
    const safeFileName = `${timestamp}_${randomString}.${fileExtension}`
    const filePath = folder ? `${folder}/${safeFileName}` : safeFileName

    console.log("📤 업로드 경로:", filePath)

    try {
      // Supabase Storage에 업로드
      console.log("📤 Supabase Storage 업로드 시작...")
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // 덮어쓰기 방지
      })

      if (error) {
        console.error("❌ Supabase 업로드 오류:", error)

        // 구체적인 오류 타입에 따른 처리
        if (error.message.includes("Payload too large")) {
          const isVideoFile = getMaxFileSize(file) === MAX_VIDEO_SIZE
          const fileType = isVideoFile ? "영상" : "이미지"
          const maxSizeMB = Math.round(getMaxFileSize(file) / 1024 / 1024)

          return NextResponse.json(
            {
              success: false,
              error: `${fileType} 파일 크기가 너무 큽니다. 최대 ${maxSizeMB}MB까지 업로드 가능합니다.`,
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

        if (error.message.includes("new row violates row-level security policy")) {
          return NextResponse.json(
            {
              success: false,
              error: "스토리지 권한이 없습니다. RLS 정책을 확인해주세요.",
              details: "uploads 버킷에 대한 INSERT 권한이 필요합니다.",
            },
            { status: 403 },
          )
        }

        return NextResponse.json(
          {
            success: false,
            error: `업로드 실패: ${error.message}`,
            details: error,
          },
          { status: 500 },
        )
      }

      console.log("✅ Supabase 업로드 성공:", data)

      // 업로드된 파일 존재 여부 확인
      try {
        const { data: fileInfo, error: fileError } = await supabase.storage
          .from(bucket)
          .list(folder, { search: safeFileName })

        if (fileError) {
          console.warn("⚠️ 파일 존재 확인 실패:", fileError)
        } else {
          const fileExists = fileInfo?.some((f) => f.name === safeFileName)
          console.log("📋 파일 존재 확인:", fileExists ? "✅ 존재함" : "❌ 존재하지 않음")
        }
      } catch (verifyError) {
        console.warn("⚠️ 파일 존재 확인 중 오류:", verifyError)
      }

      // Public URL 생성
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`

      console.log("✅ 업로드 완료:", {
        path: data.path,
        publicUrl,
        fileType,
        originalName: file.name,
        size: file.size,
      })

      // 이미지 파일인지 확인하는 함수
      const isImageFile = (fileType: string) => {
        return fileType.startsWith("image/")
      }

      const isVideoFile = (fileType: string) => {
        return fileType.startsWith("video/")
      }

      return NextResponse.json({
        success: true,
        data: {
          path: data.path,
          publicUrl,
          fileName: file.name,
          fileType: fileType,
          isImage: isImageFile(fileType),
          isVideo: isVideoFile(fileType),
          fileSize: file.size,
          bucket,
          folder,
        },
        // 기존 응답 형식과의 호환성을 위해 url도 포함
        url: publicUrl,
      })
    } catch (uploadError) {
      console.error("❌ Supabase 업로드 중 오류:", uploadError)
      return NextResponse.json(
        {
          success: false,
          error: `업로드 중 오류가 발생했습니다: ${uploadError instanceof Error ? uploadError.message : "알 수 없는 오류"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("❌ Upload API 전체 오류:", error)
    return NextResponse.json(
      {
        success: false,
        error: `서버 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
      },
      { status: 500 },
    )
  }
}
