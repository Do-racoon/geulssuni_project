import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("API: Fetching book with ID:", params.id)

    const { data, error } = await supabase.from("books").select("*").eq("id", params.id).single()

    if (error) {
      console.error("API: Supabase error fetching book:", error)
      throw error
    }

    // 조회수 증가 (별도 호출)
    await supabase
      .from("books")
      .update({ views: (data.views || 0) + 1 })
      .eq("id", params.id)
      .catch((err) => {
        console.error("API: Error incrementing book views:", err)
      })

    console.log("API: Book fetched successfully:", data?.title)

    // 응답 시 클라이언트가 기대하는 필드명으로 변환
    const responseData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    const response = NextResponse.json(responseData)
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")

    return response
  } catch (error) {
    console.error("API: Error fetching book:", error)
    return NextResponse.json(
      { error: "Book not found", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 404 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const bookData = await request.json()
    console.log("=== PUT /api/books/" + params.id + " ===")
    console.log("Raw request data:", JSON.stringify(bookData, null, 2))

    // 데이터 검증
    if (!bookData.title || !bookData.author) {
      console.error("Validation failed: Missing title or author")
      return NextResponse.json({ error: "Title and author are required" }, { status: 400 })
    }

    // 기존 데이터 확인
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Book not found:", fetchError)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    console.log("Existing book data:", JSON.stringify(existingBook, null, 2))

    // DB 스키마에 정확히 맞게 데이터 매핑
    const updateData = {
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
    }

    console.log("Processed update data:", JSON.stringify(updateData, null, 2))

    // Supabase에 업데이트
    const { data, error } = await supabase.from("books").update(updateData).eq("id", params.id).select("*").single()

    if (error) {
      console.error("Supabase UPDATE error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Database update failed",
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("Book updated successfully:", data)

    // 응답 시 클라이언트가 기대하는 필드명으로 변환
    const responseData = {
      ...data,
      purchase_link: data.purchase_url,
      external_link: data.contact_url,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("API: Unexpected error updating book:", error)
    return NextResponse.json(
      {
        error: "Failed to update book",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("=== DELETE /api/books/" + params.id + " ===")

    // 기존 데이터 확인
    const { data: existingBook, error: fetchError } = await supabase
      .from("books")
      .select("*")
      .eq("id", params.id)
      .single()

    if (fetchError) {
      console.error("Book not found for deletion:", fetchError)
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    console.log("Deleting book:", existingBook.title)

    const { error } = await supabase.from("books").delete().eq("id", params.id)

    if (error) {
      console.error("Supabase DELETE error:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      })
      return NextResponse.json(
        {
          error: "Database delete failed",
          details: error.message,
          hint: error.hint,
          code: error.code,
        },
        { status: 500 },
      )
    }

    console.log("Book deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("API: Unexpected error deleting book:", error)
    return NextResponse.json(
      {
        error: "Failed to delete book",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
