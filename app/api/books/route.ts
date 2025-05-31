import { NextResponse } from "next/server"
import { getBooks } from "@/lib/api/books"

export async function GET() {
  try {
    const books = await getBooks()
    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)
    // 더 자세한 오류 정보 반환
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to fetch books", details: errorMessage }, { status: 500 })
  }
}
