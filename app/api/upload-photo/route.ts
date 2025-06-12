import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase-admin"

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    // Create admin client
    const supabaseAdmin = createAdminClient()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `photos/${fileName}`

    console.log(`Uploading to: uploads/${filePath}`)

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = new Uint8Array(arrayBuffer)

    // Upload using admin client (bypasses RLS)
    const { error: uploadError } = await supabaseAdmin.storage.from("uploads").upload(filePath, fileBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    // Get public URL
    const { data } = supabaseAdmin.storage.from("uploads").getPublicUrl(filePath)

    console.log(`File uploaded successfully: ${data.publicUrl}`)

    return NextResponse.json({
      success: true,
      url: data.publicUrl,
      message: "Photo uploaded successfully",
    })
  } catch (error) {
    console.error("API upload error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 })
  }
}
