import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    console.log("API: Fetching books...")

    const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("API: Supabase error fetching books:", error)
      throw error
    }

    console.log("API: Books fetched successfully:", data?.length || 0)

    const response = NextResponse.json(data || [])
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    response.headers.set("Pragma", "no-cache")
    response.headers.set("Expires", "0")

    return response
  } catch (error) {
    console.error("API: Error fetching books:", error)
    return NextResponse.json(
      { error: "Failed to fetch books", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const bookData = await request.json()
    console.log("=== POST /api/books ===")
    console.log("Raw request data:", JSON.stringify(bookData, null, 2))

    // 데이터 검증
    if (!bookData.title || !bookData.author) {
      console.error("Validation failed: Missing title or author")
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    // DB 스키마에 정확히 맞게 데이터 매핑
    const insertData = {
      title: String(bookData.title).trim(),
      author: String(bookData.author).trim(),
      description: bookData.description ? String(bookData.description).trim() : null,
      cover_url: bookData.cover_url ? String(bookData.cover_url).trim() : null,
      category: bookData.category ? String(bookData.category).trim() : null,
      pages: bookData.pages ? Number.parseInt(String(bookData.pages)) : null,
      // DB 필드명에 맞게 수정
      purchase_url: bookData.purchase_link ? String(bookData.purchase_link).trim() : null,
      contact_url: bookData.external_link ? String(bookData.external_link).trim() : null,
      // tags는 문자열 배열로 처리
      tags: Array.isArray(bookData.tags) ? bookData.tags.filter((tag) => typeof tag === "string" && tag.trim()) : null,
      is_published: Boolean(bookData.is_published),
      content: bookData.content ? String(bookData.content) : null,
      views: 0,
      sales_count: 0,
      price: null, // 현재 사용하지 않지만 DB에 있는 필드
      author_id: null, // 현재 사용하지 않지만 DB에 있는 필드
    }

    console.log("Processed insert data:", JSON.stringify(insertData, null, 2))

    // Supabase에 삽입
    const { data, error } = await supabase.from("books").insert([insertData]).select("*").single()

    if (error) {
      console.error("Supabase INSERT error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Database insert failed",
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("Book created successfully:", data)

    // 응답 시 클라이언트가 기대하는 필드명으로 변환
    const responseData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error("API: Unexpected error creating book:", error)
    return NextResponse.json(
      {
        error: "Failed to create book",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
