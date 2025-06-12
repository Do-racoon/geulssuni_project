export const STORAGE_BUCKET = "uploads"
export const PHOTOS_FOLDER = "photos"

export async function uploadPhotoFile(file: File): Promise<string | null> {
  try {
    console.log(`Starting upload via API: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // Create form data
    const formData = new FormData()
    formData.append("file", file)

    // Upload via API route
    const response = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || "Upload failed")
    }

    if (!result.success || !result.url) {
      throw new Error("Invalid response from upload API")
    }

    console.log(`File uploaded successfully via API: ${result.url}`)
    return result.url
  } catch (error) {
    console.error("Error uploading photo via API:", error)
    throw error
  }
}

// Legacy function for backward compatibility
export async function uploadImageFile(file: File, folder = PHOTOS_FOLDER): Promise<string | null> {
  return uploadPhotoFile(file)
}
