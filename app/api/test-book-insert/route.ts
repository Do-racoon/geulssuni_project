import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("=== Testing Book Insert ===")

    // 테스트 데이터
    const testBook = {
      title: "테스트 책 " + Date.now(),
      author: "테스트 작가",
      description: "테스트 설명",
      category: "작법서",
      pages: 100,
      is_published: true,
      tags: ["테스트", "디버깅"],
      views: 0,
      sales_count: 0,
    }

    console.log("Test book data:", JSON.stringify(testBook, null, 2))

    // 직접 Supabase에 삽입 테스트
    const { data, error } = await supabase.from("books").insert([testBook]).select("*").single()

    if (error) {
      console.error("Direct insert test failed:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("Direct insert test successful:", data)

    return NextResponse.json({
      success: true,
      message: "Test book inserted successfully",
      data: data,
    })
  } catch (error) {
    console.error("Test insert error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
