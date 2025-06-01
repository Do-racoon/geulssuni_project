import { createClient as createSupabaseClientOriginal } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Factory 패턴: 새 클라이언트 인스턴스 생성
export function createSupabaseClient() {
  return createSupabaseClientOriginal<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "supabase.auth.token",
    },
  })
}

// 기존 코드와의 호환성을 위한 함수들
export const getSupabaseClient = createSupabaseClient
export const createClient = createSupabaseClient
export const supabase = createSupabaseClient()

// 타입 안전 클라이언트 생성 함수
export const createSupabaseClientTyped = createSupabaseClient

// createClientComponentClient 대체 함수
export const createClientComponentClient = createSupabaseClient

// 디버깅을 위한 함수
export async function testSupabaseConnection() {
  try {
    const client = createSupabaseClient()
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
    const client = createSupabaseClient()
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
