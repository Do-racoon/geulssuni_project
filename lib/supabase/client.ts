import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 싱글톤 패턴으로 클라이언트 인스턴스 관리
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "supabase.auth.token",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })
  }
  return supabaseInstance
}

// 싱글톤 인스턴스를 supabase 이름으로 export
export const supabase = getSupabaseClient()

// 기존 코드와의 호환성을 위해 createClient도 export
// export const createClient = () => {
//   return getSupabaseClient()
// }

// 디버깅을 위한 함수
export async function testSupabaseConnection() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.from("books").select("count(*)").limit(1)
    if (error) throw error
    console.log("Supabase connection test successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("Supabase connection test failed:", error)
    return { success: false, error }
  }
}

// 파일 업로드 헬퍼 함수
export async function uploadFile(file: File, bucket = "uploads", folder = "") {
  try {
    const client = getSupabaseClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${folder ? "/" : ""}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await client.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = client.storage.from(bucket).getPublicUrl(fileName)

    return {
      path: data.path,
      publicUrl,
      fileName,
    }
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}
