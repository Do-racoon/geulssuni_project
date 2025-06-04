import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

// 전역 싱글톤 인스턴스
declare global {
  var __supabase_client__: any
}

export function getSupabaseClient() {
  // 이미 생성된 인스턴스가 있으면 재사용
  if (typeof window !== "undefined" && window.__supabase_client__) {
    return window.__supabase_client__
  }

  if (typeof global !== "undefined" && global.__supabase_client__) {
    return global.__supabase_client__
  }

  // 새 인스턴스 생성
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document !== "undefined") {
            const value = `; ${document.cookie}`
            const parts = value.split(`; ${name}=`)
            if (parts.length === 2) return parts.pop()?.split(";").shift()
          }
          return undefined
        },
        set(name: string, value: string, options: any) {
          if (typeof document !== "undefined") {
            let cookieString = `${name}=${value}`

            if (options?.maxAge) {
              cookieString += `; max-age=${options.maxAge}`
            }
            if (options?.path) {
              cookieString += `; path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`
            }
            if (options?.secure) {
              cookieString += "; secure"
            }
            if (options?.httpOnly) {
              cookieString += "; httponly"
            }
            if (options?.sameSite) {
              cookieString += `; samesite=${options.sameSite}`
            }

            document.cookie = cookieString
          }
        },
        remove(name: string, options: any) {
          if (typeof document !== "undefined") {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`

            if (options?.path) {
              cookieString += `; path=${options.path}`
            }
            if (options?.domain) {
              cookieString += `; domain=${options.domain}`
            }

            document.cookie = cookieString
          }
        },
      },
      auth: {
        persistSession: true,
        storageKey: "sb-auth-token",
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window !== "undefined") {
              // localStorage에서 먼저 확인 (더 안정적)
              const localValue = localStorage.getItem(key)
              if (localValue) {
                return localValue
              }

              // 쿠키에서 확인
              const cookieValue = document.cookie
                .split("; ")
                .find((row) => row.startsWith(`${key}=`))
                ?.split("=")[1]

              return cookieValue || null
            }
            return null
          },
          setItem: (key: string, value: string) => {
            if (typeof window !== "undefined") {
              // localStorage에 저장
              localStorage.setItem(key, value)

              // 쿠키에도 백업 저장
              try {
                document.cookie = `${key}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; secure; samesite=lax`
              } catch (error) {
                console.warn("Failed to set cookie:", error)
              }
            }
          },
          removeItem: (key: string) => {
            if (typeof window !== "undefined") {
              localStorage.removeItem(key)
              try {
                document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
              } catch (error) {
                console.warn("Failed to remove cookie:", error)
              }
            }
          },
        },
      },
    },
  )

  // 전역에 저장하여 싱글톤 보장
  if (typeof window !== "undefined") {
    window.__supabase_client__ = client
  } else if (typeof global !== "undefined") {
    global.__supabase_client__ = client
  }

  // 인증 상태 변경 감지 및 세션 복원
  if (typeof window !== "undefined") {
    client.auth.onAuthStateChange(async (event, session) => {
      if (event === "INITIAL_SESSION") {
        // 초기 세션 로드 시 세션 복원 시도
        if (!session) {
          try {
            const { data } = await client.auth.getSession()
            if (data.session) {
              console.log("✅ Session restored from storage")
            }
          } catch (error) {
            console.warn("Failed to restore session:", error)
          }
        }
      } else if (event === "SIGNED_IN") {
        console.log("✅ User signed in")
      } else if (event === "SIGNED_OUT") {
        console.log("👋 User signed out")
      } else if (event === "TOKEN_REFRESHED") {
        console.log("🔄 Token refreshed")
      }
    })
  }

  return client
}

// 기존 코드와의 호환성을 위한 모든 export
export const createSupabaseClient = getSupabaseClient
export const createClient = getSupabaseClient
export const createClientComponentClient = getSupabaseClient
export const createSupabaseClientTyped = getSupabaseClient

// 지연 초기화된 인스턴스
let _supabaseInstance: any = null
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (!_supabaseInstance) {
      _supabaseInstance = getSupabaseClient()
    }
    return _supabaseInstance[prop]
  },
})

// 세션 복원 헬퍼 함수
export async function restoreSession() {
  const client = getSupabaseClient()
  try {
    const { data, error } = await client.auth.getSession()
    if (error) throw error
    return data.session
  } catch (error) {
    console.error("Failed to restore session:", error)
    return null
  }
}

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
