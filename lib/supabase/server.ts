import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// 서버 측 환경 변수 사용
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  console.error("Missing server-side Supabase environment variables:", {
    url: supabaseUrl ? "OK" : "MISSING",
    serviceKey: supabaseServiceKey ? "OK" : "MISSING",
    anonKey: supabaseAnonKey ? "OK" : "MISSING",
  })
}

// 서버 측에서는 가능하면 service role key 사용
export const supabase = createClient<Database>(supabaseUrl || "", supabaseServiceKey || supabaseAnonKey || "", {
  auth: {
    persistSession: false,
  },
})

// 기존 코드와의 호환성을 위해 두 가지 export 제공
export const supabaseServer = supabase

// createClient 함수도 export
export const createServerClient = () => {
  return createClient<Database>(supabaseUrl || "", supabaseServiceKey || supabaseAnonKey || "", {
    auth: {
      persistSession: false,
    },
  })
}

// createClient 함수 export 추가 (기존 코드와의 호환성을 위해)
// export const createClient = createServerClient // Removed redeclaration

// @supabase/supabase-js의 createClient도 re-export
export { createClient as supabaseCreateClient } from "@supabase/supabase-js"

export async function getServerSession() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting server session:", error)
    return null
  }
}

export async function getServerUser() {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting server user:", error)
    return null
  }
}
