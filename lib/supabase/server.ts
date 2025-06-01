import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// 서버 측 환경 변수 사용
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// 환경 변수 로깅 (개발 환경에서만)
if (process.env.NODE_ENV === "development") {
  console.log("🔍 Server Supabase 환경 변수 체크:", {
    url: supabaseUrl ? "OK" : "MISSING",
    serviceKey: supabaseServiceKey ? "OK" : "MISSING",
    anonKey: supabaseAnonKey ? "OK" : "MISSING",
  })
}

// 환경 변수가 없어도 에러를 던지지 않고 기본값 사용
const defaultUrl = supabaseUrl || "https://placeholder.supabase.co"
const defaultKey = supabaseServiceKey || supabaseAnonKey || "placeholder-key"

// 서버 측에서는 가능하면 service role key 사용
export function createServerClient() {
  try {
    return createClient<Database>(defaultUrl, defaultKey, {
      auth: {
        persistSession: false,
      },
    })
  } catch (error) {
    console.error("❌ Failed to create server Supabase client:", error)
    // 에러가 발생해도 기본 클라이언트 반환
    return createClient<Database>("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        persistSession: false,
      },
    })
  }
}

// 기본 서버 클라이언트
export const supabase = createServerClient()

// 기존 코드와의 호환성을 위해 두 가지 export 제공
export const supabaseServer = supabase

export async function getServerSession() {
  try {
    const client = createServerClient()
    const {
      data: { session },
    } = await client.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

export async function getServerUser() {
  try {
    const client = createServerClient()
    const {
      data: { user },
    } = await client.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}
