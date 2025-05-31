import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const supabase = createClient()
    const { key } = params

    const { data, error } = await supabase.from("global_settings").select("value").eq("key", key).single()

    if (error) {
      return NextResponse.json({ error: "Setting not found" }, { status: 404 })
    }

    return NextResponse.json({ value: data.value })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { key: string } }) {
  try {
    const supabase = createClient()
    const { key } = params

    const body = await request.json()
    const { value } = body

    // First, try to update existing setting
    const { data: updateData, error: updateError } = await supabase
      .from("global_settings")
      .update({
        value: value.toString(),
        updated_at: new Date().toISOString(),
      })
      .eq("key", key)
      .select()

    if (updateError) {
      // If update fails, try to insert new setting
      const { data: insertData, error: insertError } = await supabase
        .from("global_settings")
        .insert({
          key,
          value: value.toString(),
          description: `Setting for ${key}`,
        })
        .select()

      if (insertError) {
        return NextResponse.json(
          {
            error: "Failed to save setting",
            details: insertError.message,
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ success: true, data: insertData[0] })
    }

    return NextResponse.json({ success: true, data: updateData[0] })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
