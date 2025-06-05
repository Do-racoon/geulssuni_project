import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // 리다이렉션 루프 방지를 위한 헤더 체크
  const redirectCount = Number.parseInt(req.headers.get("x-redirect-count") || "0")
  if (redirectCount > 3) {
    console.log("🚫 Too many redirects, breaking loop")
    return NextResponse.redirect(new URL("/about", req.url))
  }

  const supabase = createMiddlewareClient({ req, res })

  // Skip middleware for debug pages and static files
  if (
    req.nextUrl.pathname === "/admin-debug" ||
    req.nextUrl.pathname === "/auth-debug" ||
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".") ||
    req.nextUrl.pathname === "/admin" || // 중요: admin 메인 페이지는 미들웨어 스킵
    req.nextUrl.pathname === "/admin/" // 슬래시가 있는 버전도 스킵
  ) {
    console.log("🔧 Skipping middleware for:", req.nextUrl.pathname)
    return res
  }

  // Admin routes protection (admin 메인 페이지 제외)
  if (req.nextUrl.pathname.startsWith("/admin")) {
    console.log("🔍 Admin route accessed:", req.nextUrl.pathname)

    // admin/login 페이지는 인증 체크 스킵
    if (req.nextUrl.pathname === "/admin/login") {
      console.log("✅ Admin login page, skipping auth check")
      return res
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      console.log("📋 Session check:", {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
        error: sessionError?.message,
        pathname: req.nextUrl.pathname,
      })

      if (sessionError || !session?.user) {
        console.log("❌ No valid session, redirecting to admin login")
        const loginUrl = new URL("/admin/login", req.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }

      // 간소화된 권한 체크: 세션만 확인하고 나머지는 클라이언트에서 처리
      console.log("✅ Admin session found, allowing access")
      return res
    } catch (error) {
      console.error("💥 Middleware error:", error)

      // 에러 발생 시 admin/login으로 리다이렉트
      if (req.nextUrl.pathname !== "/admin/login") {
        const loginUrl = new URL("/admin/login", req.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }

      return res
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/board/create", "/board/assignment/create"]

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        console.log("❌ No session for protected route:", req.nextUrl.pathname)
        const loginUrl = new URL("/login", req.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }
    } catch (error) {
      console.error("💥 Protected route error:", error)
      const loginUrl = new URL("/login", req.url)
      const response = NextResponse.redirect(loginUrl)
      response.headers.set("x-redirect-count", (redirectCount + 1).toString())
      return response
    }
  }

  // Assignment edit routes
  if (req.nextUrl.pathname.match(/^\/board\/assignment\/[^/]+\/edit$/)) {
    console.log("🎯 Assignment edit route detected:", req.nextUrl.pathname)

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError || !session?.user) {
        console.log("❌ No session for edit route, redirecting to login")
        const loginUrl = new URL("/login", req.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }

      // 간소화된 권한 체크: 세션만 확인하고 나머지는 클라이언트에서 처리
      console.log("✅ Edit route session found, allowing access")
      return res
    } catch (error) {
      console.error("💥 Edit route middleware error:", error)
      const loginUrl = new URL("/login", req.url)
      const response = NextResponse.redirect(loginUrl)
      response.headers.set("x-redirect-count", (redirectCount + 1).toString())
      return response
    }
  }

  return res
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/profile/:path*",
    "/board/create/:path*",
    "/board/assignment/create/:path*",
    "/board/assignment/:path*/edit",
  ],
}
