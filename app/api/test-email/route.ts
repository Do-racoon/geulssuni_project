import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Resend API 테스트
    if (process.env.RESEND_API_KEY) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.SMTP_FROM || "noreply@yourdomain.com",
          to: ["test@example.com"],
          subject: "이메일 테스트",
          html: "<p>이메일 발송 테스트입니다.</p>",
        }),
      })

      if (response.ok) {
        const result = await response.json()
        return NextResponse.json({
          success: true,
          message: "Resend API 연결 성공!",
          result,
        })
      } else {
        const error = await response.text()
        return NextResponse.json(
          {
            success: false,
            error: `Resend API 오류: ${error}`,
          },
          { status: 500 },
        )
      }
    } else {
      return NextResponse.json({
        success: false,
        message: "RESEND_API_KEY가 설정되지 않았습니다.",
        note: "현재는 콘솔 출력 모드로 작동합니다.",
      })
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "이메일 테스트 실패",
      },
      { status: 500 },
    )
  }
}
