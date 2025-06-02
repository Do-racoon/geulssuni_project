import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"
import { supabase as clientSupabase } from "@/lib/supabase/client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // 환경 변수 확인
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "missing",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "present" : "missing",
      SUPABASE_URL: process.env.SUPABASE_URL || "missing",
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "present" : "missing",
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "present" : "missing",
    }

    // 서버 측 Supabase 테스트
    const serverTest = await supabase
      .from("books")
      .select("count(*)")
      .single()
      .catch((err) => ({ error: err.message }))

    // 클라이언트 측 Supabase 테스트 (서버에서 실행)
    const clientTest = await clientSupabase
      .from("books")
      .select("count(*)")
      .single()
      .catch((err) => ({ error: err.message }))

    // 테스트 데이터 삽입 시도
    const testInsert = await supabase
      .from("books")
      .insert([
        {
          title: "Test Book " + new Date().toISOString(),
          author: "API Test",
          description: "This is a test book created by the API test endpoint",
          is_published: true,
          views: 0,
          sales_count: 0,
        },
      ])
      .select("*")
      .single()
      .catch((err) => ({ error: err.message }))

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      envVars,
      serverTest,
      clientTest,
      testInsert,
    })
  } catch (error) {
    console.error("API test error:", error)
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
