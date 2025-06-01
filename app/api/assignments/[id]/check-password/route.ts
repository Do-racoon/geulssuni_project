import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { password } = await request.json()

    console.log("🔐 Password check API called:", {
      assignmentId: params.id,
      receivedPassword: password,
      passwordType: typeof password,
      passwordLength: password?.length,
    })

    if (!password) {
      return NextResponse.json({ error: "비밀번호를 입력해주세요." }, { status: 400 })
    }

    // 과제의 비밀번호 확인
    const { data: assignment, error } = await supabase
      .from("board_posts")
      .select("password")
      .eq("id", params.id)
      .eq("category", "assignment")
      .single()

    console.log("🔍 Database query result:", {
      found: !!assignment,
      error: error?.message,
      storedPassword: assignment?.password,
      storedPasswordType: typeof assignment?.password,
      storedPasswordLength: assignment?.password?.length,
    })

    if (error || !assignment) {
      console.log("❌ Assignment not found:", error)
      return NextResponse.json({ error: "과제를 찾을 수 없습니다." }, { status: 404 })
    }

    // 비밀번호 비교 (다양한 방식으로 시도)
    const inputPassword = String(password).trim()
    const storedPassword = String(assignment.password || "").trim()

    console.log("🔍 Password comparison:", {
      inputPassword,
      storedPassword,
      exactMatch: inputPassword === storedPassword,
      caseInsensitiveMatch: inputPassword.toLowerCase() === storedPassword.toLowerCase(),
      inputBytes: Array.from(inputPassword).map((c) => c.charCodeAt(0)),
      storedBytes: Array.from(storedPassword).map((c) => c.charCodeAt(0)),
    })

    // 비밀번호 확인 (대소문자 구분, 공백 제거)
    if (inputPassword === storedPassword) {
      console.log("✅ Password match successful")
      return NextResponse.json({ success: true })
    } else {
      console.log("❌ Password mismatch")
      return NextResponse.json(
        {
          error: "비밀번호가 올바르지 않습니다.",
          debug:
            process.env.NODE_ENV === "development"
              ? {
                  input: inputPassword,
                  stored: storedPassword,
                  inputLength: inputPassword.length,
                  storedLength: storedPassword.length,
                }
              : undefined,
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("💥 Password check error:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
