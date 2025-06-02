import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const bucket = formData.get("bucket") as string
    const path = formData.get("path") as string
    const entityType = formData.get("entity_type") as string
    const entityId = formData.get("entity_id") as string

    if (!file || !bucket || !path) {
      return NextResponse.json({ error: "Missing required fields: file, bucket, or path" }, { status: 400 })
    }

    console.log("Server-side upload:", { bucket, path, fileName: file.name, size: file.size, entityType, entityId })

    // Upload to Supabase Storage using server client
    const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Storage upload error:", error)
      return NextResponse.json({ error: "Upload failed", details: error.message }, { status: 500 })
    }

    // Get public URL
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${data.path}`

    console.log("Upload successful:", { path: data.path, publicUrl })

    // 작가 이미지인 경우 authors 테이블에 직접 업데이트
    if (entityType === "writer" || entityType === "author") {
      try {
        const { error: updateError } = await supabase
          .from("authors")
          .update({ image_url: publicUrl, updated_at: new Date().toISOString() })
          .eq("id", entityId)

        if (updateError) {
          console.error("Failed to update author image URL:", updateError)
          // 업로드는 성공했으므로 계속 진행
        } else {
          console.log("Author image URL updated successfully")
        }
      } catch (dbError) {
        console.error("Database update error:", dbError)
        // 업로드는 성공했으므로 계속 진행
      }
    }

    return NextResponse.json({
      success: true,
      path: data.path,
      publicUrl,
      message: "File uploaded successfully",
    })
  } catch (error) {
    console.error("Upload API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
