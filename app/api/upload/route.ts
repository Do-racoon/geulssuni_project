import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get("file") as unknown as File

    if (!file) {
      return NextResponse.json({ error: "No file received." }, { status: 400 })
    }

    // 파일 타입 검증 (이미지와 비디오 모두 허용)
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
      return NextResponse.json(
        {
          error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG) are allowed.",
        },
        { status: 400 },
      )
    }

    // 파일 크기 제한 (이미지: 10MB, 비디오: 100MB)
    const maxSize = file.type.startsWith("video/") ? 100 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      const maxSizeMB = file.type.startsWith("video/") ? "100MB" : "10MB"
      return NextResponse.json(
        {
          error: `File too large. Maximum size is ${maxSizeMB}.`,
        },
        { status: 400 },
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // public/uploads 디렉토리 경로
    const uploadDir = join(process.cwd(), "public", "uploads")

    // 디렉토리가 없으면 생성
    if (!existsSync(uploadDir)) {
      try {
        await mkdir(uploadDir, { recursive: true })
        console.log("Created uploads directory:", uploadDir)
      } catch (mkdirError) {
        console.error("Error creating directory:", mkdirError)
        return NextResponse.json({ error: "Failed to create upload directory." }, { status: 500 })
      }
    }

    const filePath = join(uploadDir, filename)

    // 파일 저장
    try {
      await writeFile(filePath, buffer)
      console.log("File saved successfully:", filePath)
    } catch (writeError) {
      console.error("Error writing file:", writeError)
      return NextResponse.json({ error: "Failed to save file." }, { status: 500 })
    }

    // 파일 URL 반환
    const fileUrl = `/uploads/${filename}`

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed." }, { status: 500 })
  }
}
