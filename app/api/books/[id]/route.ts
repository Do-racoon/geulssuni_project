import { NextResponse } from "next/server"
import { getBook, incrementBookViews } from "@/lib/api/books"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const book = await getBook(params.id)

    // Increment views when fetching a book
    await incrementBookViews(params.id)

    return NextResponse.json(book)
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Book not found" }, { status: 404 })
  }
}
