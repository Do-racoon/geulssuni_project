import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import TalkButton from "@/components/talk-button"

// 일단 정적 메타데이터로 안전하게 배포
export const metadata = {
  title: "글쓰니",
  description: "글쓰기 교육 플랫폼",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/abc1234.css" />
      </head>
      <body className="min-h-screen bg-white font-light pt-16 font-serif flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <ScrollToTop />
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
          <TalkButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
