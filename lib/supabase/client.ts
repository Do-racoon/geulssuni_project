import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// 단일 클라이언트 인스턴스를 위한 싱글톤 패턴
let _supabaseInstance: any = null
let _instanceCount = 0

export function createSupabaseClient() {
  if (_supabaseInstance) {
    console.log(`[Supabase] Reusing existing client instance (count: ${_instanceCount})`)
    return _supabaseInstance
  }

  console.log(`[Supabase] Creating new client instance`)
  _supabaseInstance = createClientComponentClient<Database>()
  _instanceCount++

  // 인스턴스 생성 추적
  console.log(`[Supabase] Client instance created (total: ${_instanceCount})`)

  return _supabaseInstance
}

// 기존 코드와의 호환성을 위한 모든 export
export const createClient = createSupabaseClient
export const createSupabaseClientTyped = createSupabaseClient
export const getSupabaseClient = createSupabaseClient

// 지연 초기화된 인스턴스 - 더 안전한 프록시 구현
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabaseInstance) {
      console.log(`[Supabase] Lazy initializing client for property: ${String(prop)}`)
      _supabaseInstance = createClientComponentClient<Database>()
      _instanceCount++
    }
    return _supabaseInstance[prop]
  },
})

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

// 인스턴스 상태 확인 함수
export function getInstanceInfo() {
  return {
    hasInstance: !!_supabaseInstance,
    instanceCount: _instanceCount,
  }
}

// 강제 리셋 함수 (디버깅용)
export function resetSupabaseInstance() {
  console.log(`[Supabase] Resetting instance (was count: ${_instanceCount})`)
  _supabaseInstance = null
  _instanceCount = 0
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
