import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    return NextResponse.json({
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      isReady: !!(supabaseUrl && supabaseServiceKey),
      url: supabaseUrl ? "✅ Set" : "❌ Missing",
      serviceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}
