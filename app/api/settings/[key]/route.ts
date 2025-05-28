import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const supabase = createClient()
    const { key } = params

    const { data, error } = await supabase.from("global_settings").select("value").eq("key", key).single()

    if (error) {
      console.error("Error fetching setting:", error)
      return NextResponse.json({ error: "Setting not found" }, { status: 404 })
    }

    return NextResponse.json({ value: data.value })
  } catch (error) {
    console.error("Error in settings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const supabase = createClient()
    const { key } = params
    const { value } = await request.json()

    const { data, error } = await supabase
      .from("global_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)
      .select()
      .single()

    if (error) {
      console.error("Error updating setting:", error)
      return NextResponse.json({ error: "Failed to update setting" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in settings API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
