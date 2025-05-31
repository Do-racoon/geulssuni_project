import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables:", {
    url: supabaseUrl ? "OK" : "MISSING",
    key: supabaseAnonKey ? "OK" : "MISSING",
  })
}

// 메인 클라이언트 생성
export const supabase = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)

// createClient 함수 export (기존 코드와의 호환성을 위해)
export const createClient = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// 타입 안전 클라이언트 생성 함수
export const createSupabaseClientTyped = () => {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
}

// 싱글톤 클라이언트 (기존 코드와의 호환성을 위해)
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export const getSupabaseClient = () => {
  if (typeof window === "undefined") {
    // 서버 사이드에서는 새 클라이언트 생성
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  }

  if (!supabaseClient) {
    // 클라이언트 사이드에서는 싱글톤 사용
    supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// 디버깅을 위한 함수
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("books").select("count(*)").limit(1)
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
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${folder ? "/" : ""}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      throw error
    }

    // 공개 URL 가져오기
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName)

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
