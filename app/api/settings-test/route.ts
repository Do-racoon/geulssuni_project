import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

// Simple test endpoint to debug the issue
export async function GET() {
  try {
    return NextResponse.json({ success: true, message: "Settings test API is working" })
  } catch (error) {
    return NextResponse.json({ error: "Test failed" }, { status: 500 })
  }
}

// Simple update endpoint that doesn't use dynamic routes
export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    // First check if the setting exists
    const { data: existingData, error: checkError } = await supabase
      .from("global_settings")
      .select("id")
      .eq("key", key)
      .maybeSingle()

    let result

    if (!existingData) {
      // Insert new setting
      const { data, error } = await supabase
        .from("global_settings")
        .insert({
          key,
          value: value.toString(),
          description: `Setting for ${key}`,
        })
        .select()

      if (error) {
        console.error("Insert error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
    } else {
      // Update existing setting
      const { data, error } = await supabase
        .from("global_settings")
        .update({
          value: value.toString(),
          updated_at: new Date().toISOString(),
        })
        .eq("key", key)
        .select()

      if (error) {
        console.error("Update error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Settings API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
