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
    req.nextUrl.pathname.includes(".")
  ) {
    console.log("🔧 Skipping middleware for:", req.nextUrl.pathname)
    return res
  }

  // Admin routes protection
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

      // Check if user is admin with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000),
      )

      const userQueryPromise = supabase
        .from("users")
        .select("role, email, name, is_active")
        .eq("id", session.user.id)
        .single()

      const { data: user, error: userError } = (await Promise.race([userQueryPromise, timeoutPromise])) as any

      console.log("👤 User data check:", {
        found: !!user,
        role: user?.role,
        email: user?.email,
        isActive: user?.is_active,
        error: userError?.message,
      })

      if (userError || !user) {
        console.log("🔍 User not found by ID, trying email search...")

        // Try to find user by email as fallback with timeout
        const emailQueryPromise = supabase
          .from("users")
          .select("role, email, name, is_active")
          .eq("email", session.user.email)
          .single()

        const { data: userByEmail, error: emailError } = (await Promise.race([
          emailQueryPromise,
          timeoutPromise,
        ])) as any

        console.log("📧 User by email check:", {
          found: !!userByEmail,
          role: userByEmail?.role,
          error: emailError?.message,
        })

        if (emailError || !userByEmail || userByEmail.role !== "admin") {
          console.log("❌ User not admin or not found via email, redirecting")
          const aboutUrl = new URL("/about", req.url)
          const response = NextResponse.redirect(aboutUrl)
          response.headers.set("x-redirect-count", (redirectCount + 1).toString())
          return response
        }
      } else if (user.role !== "admin") {
        console.log("❌ User role check failed:", {
          hasUser: !!user,
          role: user?.role,
          isActive: user?.is_active,
        })
        const aboutUrl = new URL("/about", req.url)
        const response = NextResponse.redirect(aboutUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }

      console.log("✅ Admin access granted")
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

      // 사용자 역할 확인 with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Database query timeout")), 5000),
      )

      const userQueryPromise = supabase
        .from("users")
        .select("role, email, name, is_active")
        .eq("id", session.user.id)
        .single()

      const { data: user, error: userError } = (await Promise.race([userQueryPromise, timeoutPromise])) as any

      if (userError && session.user.email) {
        // 이메일로 재시도
        const emailQueryPromise = supabase
          .from("users")
          .select("role, email, name, is_active")
          .eq("email", session.user.email)
          .single()

        const { data: userByEmail, error: emailError } = (await Promise.race([
          emailQueryPromise,
          timeoutPromise,
        ])) as any

        if (emailError || !userByEmail || !["admin", "instructor"].includes(userByEmail.role)) {
          console.log("❌ Edit route: User not found or insufficient role via email")
          const loginUrl = new URL("/login", req.url)
          const response = NextResponse.redirect(loginUrl)
          response.headers.set("x-redirect-count", (redirectCount + 1).toString())
          return response
        }

        console.log("✅ Edit route access granted via email")
        return res
      }

      if (!user || !["admin", "instructor"].includes(user.role)) {
        console.log("❌ Edit route: Insufficient permissions")
        const loginUrl = new URL("/login", req.url)
        const response = NextResponse.redirect(loginUrl)
        response.headers.set("x-redirect-count", (redirectCount + 1).toString())
        return response
      }

      console.log("✅ Edit route access granted")
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
