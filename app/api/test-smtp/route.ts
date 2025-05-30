import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

// Node.js Runtime 사용
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("SMTP 테스트 시작...")

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      dnsTimeout: 30000,
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    })

    // SMTP 연결 테스트
    await transporter.verify()

    return NextResponse.json({
      success: true,
      message: "SMTP 연결 성공!",
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_SECURE,
        user: process.env.SMTP_USER ? "설정됨" : "설정되지 않음",
        pass: process.env.SMTP_PASS ? "설정됨" : "설정되지 않음",
      },
    })
  } catch (error) {
    console.error("SMTP 테스트 실패:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "SMTP 연결 실패",
        config: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          user: process.env.SMTP_USER ? "설정됨" : "설정되지 않음",
          pass: process.env.SMTP_PASS ? "설정됨" : "설정되지 않음",
        },
      },
      { status: 500 },
    )
  }
}
