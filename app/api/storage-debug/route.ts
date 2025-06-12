import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// 서버 사이드 Supabase 클라이언트 생성
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Storage 디버그 API 호출됨")

    // 1. 버킷 목록 확인
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()

    if (bucketsError) {
      console.error("❌ 버킷 목록 조회 오류:", bucketsError)
      return NextResponse.json({
        success: false,
        error: "버킷 목록을 조회할 수 없습니다.",
        details: bucketsError,
      })
    }

    console.log("📋 사용 가능한 버킷:", buckets)

    // 2. uploads 버킷 존재 여부 확인
    const uploadsBucket = buckets?.find((bucket) => bucket.name === "uploads")

    if (!uploadsBucket) {
      console.error("❌ uploads 버킷이 존재하지 않습니다")
      return NextResponse.json({
        success: false,
        error: "uploads 버킷이 존재하지 않습니다.",
        buckets: buckets?.map((b) => b.name) || [],
        suggestion: "Supabase 대시보드에서 'uploads' 버킷을 생성해주세요.",
      })
    }

    // 3. uploads 버킷의 파일 목록 확인
    const { data: files, error: filesError } = await supabase.storage
      .from("uploads")
      .list("", { limit: 10, sortBy: { column: "created_at", order: "desc" } })

    if (filesError) {
      console.error("❌ 파일 목록 조회 오류:", filesError)
      return NextResponse.json({
        success: false,
        error: "파일 목록을 조회할 수 없습니다.",
        details: filesError,
      })
    }

    // 4. settings 폴더의 파일 목록 확인
    const { data: settingsFiles, error: settingsError } = await supabase.storage
      .from("uploads")
      .list("settings", { limit: 10, sortBy: { column: "created_at", order: "desc" } })

    console.log("📋 uploads 버킷 파일:", files)
    console.log("📋 settings 폴더 파일:", settingsFiles)

    return NextResponse.json({
      success: true,
      data: {
        buckets:
          buckets?.map((bucket) => ({
            name: bucket.name,
            id: bucket.id,
            public: bucket.public,
            created_at: bucket.created_at,
          })) || [],
        uploadsBucket: {
          name: uploadsBucket.name,
          id: uploadsBucket.id,
          public: uploadsBucket.public,
          created_at: uploadsBucket.created_at,
        },
        recentFiles:
          files?.map((file) => ({
            name: file.name,
            size: file.metadata?.size,
            type: file.metadata?.mimetype,
            created_at: file.created_at,
            updated_at: file.updated_at,
          })) || [],
        settingsFiles:
          settingsFiles?.map((file) => ({
            name: file.name,
            size: file.metadata?.size,
            type: file.metadata?.mimetype,
            created_at: file.created_at,
            updated_at: file.updated_at,
          })) || [],
      },
    })
  } catch (error) {
    console.error("❌ Storage 디버그 오류:", error)
    return NextResponse.json({
      success: false,
      error: `Storage 디버그 오류: ${error instanceof Error ? error.message : "알 수 없는 오류"}`,
    })
  }
}
