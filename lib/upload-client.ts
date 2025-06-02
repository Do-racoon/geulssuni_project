export interface UploadOptions {
  bucket?: string
  folder?: string
}

export interface UploadResult {
  success: boolean
  data?: {
    path: string
    publicUrl: string
    fileName: string
  }
  error?: string
}

// 업로드 진행 중인 파일들을 추적하는 Set
const uploadingFiles = new Set<string>()

export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  // 파일 고유 식별자 생성 (이름 + 크기 + 수정일)
  const fileId = `${file.name}-${file.size}-${file.lastModified}`

  // 이미 업로드 중인 파일인지 확인
  if (uploadingFiles.has(fileId)) {
    console.warn("⚠️ 동일한 파일이 이미 업로드 중입니다:", fileId)
    return {
      success: false,
      error: "동일한 파일이 이미 업로드 중입니다.",
    }
  }

  try {
    // 업로드 시작 표시
    uploadingFiles.add(fileId)

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", options.bucket || "uploads")
    formData.append("folder", options.folder || "")

    console.log("📤 업로드 요청:", { fileId, bucket: options.bucket, folder: options.folder })

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Upload failed")
    }

    console.log("✅ 업로드 완료:", { fileId, result })
    return result
  } catch (error) {
    console.error("❌ Upload error:", { fileId, error })
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  } finally {
    // 업로드 완료 후 추적에서 제거
    uploadingFiles.delete(fileId)
  }
}
