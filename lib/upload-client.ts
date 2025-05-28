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

export async function uploadFile(file: File, options: UploadOptions = {}): Promise<UploadResult> {
  try {
    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error("File size must be less than 10MB")
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("bucket", options.bucket || "uploads")
    formData.append("folder", options.folder || "")

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Upload failed")
    }

    return result
  } catch (error) {
    console.error("Upload error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    }
  }
}
