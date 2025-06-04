import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// 전역 싱글톤 인스턴스
let _globalSupabaseInstance: any = null
let _instanceCreationCount = 0

// 인스턴스 생성 추적
const trackInstanceCreation = () => {
  _instanceCreationCount++
  console.warn(`[Supabase] New client instance created! Total count: ${_instanceCreationCount}`)

  if (_instanceCreationCount > 1) {
    console.error(`[Supabase] WARNING: Multiple instances detected! This may cause issues.`)
    console.trace("Instance creation stack trace:")
  }
}

// 메인 클라이언트 생성 함수
export function createSupabaseClient() {
  if (_globalSupabaseInstance) {
    console.log(`[Supabase] Reusing existing instance (count: ${_instanceCreationCount})`)
    return _globalSupabaseInstance
  }

  console.log(`[Supabase] Creating new client instance`)
  _globalSupabaseInstance = createClientComponentClient<Database>()
  trackInstanceCreation()

  return _globalSupabaseInstance
}

// 강제 싱글톤 보장
export const getSupabaseClient = () => {
  if (!_globalSupabaseInstance) {
    console.log(`[Supabase] Lazy initializing client`)
    _globalSupabaseInstance = createClientComponentClient<Database>()
    trackInstanceCreation()
  }
  return _globalSupabaseInstance
}

// 기존 코드와의 호환성
export const createClient = getSupabaseClient
export const createSupabaseClientTyped = getSupabaseClient

// 더 안전한 프록시 구현
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    const client = getSupabaseClient()
    const value = client[prop]

    if (typeof value === "function") {
      return value.bind(client)
    }

    return value
  },
})

// 디버깅 함수들
export function getInstanceInfo() {
  return {
    hasInstance: !!_globalSupabaseInstance,
    instanceCount: _instanceCreationCount,
    timestamp: new Date().toISOString(),
  }
}

export function resetSupabaseInstance() {
  console.warn(`[Supabase] Force resetting instance (was count: ${_instanceCreationCount})`)
  _globalSupabaseInstance = null
  _instanceCreationCount = 0
}

// 연결 테스트
export async function testSupabaseConnection() {
  try {
    const client = getSupabaseClient()
    const { data, error } = await client.from("books").select("count(*)").limit(1)
    if (error) throw error
    console.log("[Supabase] Connection test successful:", data)
    return { success: true, data }
  } catch (error) {
    console.error("[Supabase] Connection test failed:", error)
    return { success: false, error }
  }
}

// 파일 업로드 헬퍼
export async function uploadFile(file: File, bucket = "uploads", folder = "") {
  try {
    const client = getSupabaseClient()
    const fileExt = file.name.split(".").pop()
    const fileName = `${folder}${folder ? "/" : ""}${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    const { data, error } = await client.storage.from(bucket).upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (error) throw error

    const {
      data: { publicUrl },
    } = client.storage.from(bucket).getPublicUrl(fileName)

    return {
      path: data.path,
      publicUrl,
      fileName,
    }
  } catch (error) {
    console.error("[Supabase] Upload error:", error)
    throw error
  }
}
