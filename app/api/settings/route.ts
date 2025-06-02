import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/server"

// 설정 업데이트 API
export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    // 설정 업데이트 (없으면 생성)
    const { error } = await supabase.from("global_settings").upsert(
      {
        key,
        value: value?.toString() || "",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "key",
      },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// 설정 조회 API
export async function GET() {
  try {
    const { data, error } = await supabase.from("global_settings").select("key, value")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const settings: Record<string, string> = {}
    data.forEach((item) => {
      settings[item.key] = item.value
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
