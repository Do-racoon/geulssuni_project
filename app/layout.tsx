import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import TalkButton from "@/components/talk-button"
import { getSetting } from "@/lib/api/settings"

// 동적 메타데이터 생성
export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSetting("site_name", "글쓰니")
  const siteDescription = await getSetting("site_description", "글쓰기 교육 플랫폼")

  console.log("Layout metadata:", { siteName, siteDescription })

  return {
    title: siteName,
    description: siteDescription,
    viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover",
    generator: "v0.dev",
  }
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

export const metadata = {
      generator: 'v0.dev'
    };
