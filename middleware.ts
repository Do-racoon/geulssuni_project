import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Skip middleware for debug pages
  if (req.nextUrl.pathname === "/admin-debug" || req.nextUrl.pathname === "/auth-debug") {
    console.log("🔧 Skipping middleware for debug page")
    return res
  }

  // Admin routes protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    console.log("🔍 Admin route accessed:", req.nextUrl.pathname)

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
      })

      if (!session) {
        console.log("❌ No session found, redirecting to admin login")
        return NextResponse.redirect(new URL("/admin/login", req.url))
      }

      // Check if user is admin
      const { data: user, error: userError } = await supabase
        .from("users")
        .select("role, email, name, is_active")
        .eq("id", session.user.id)
        .single()

      console.log("👤 User data check:", {
        found: !!user,
        role: user?.role,
        email: user?.email,
        isActive: user?.is_active,
        error: userError?.message,
      })

      if (userError) {
        console.log("🔍 User not found by ID, trying email search...")

        // Try to find user by email as fallback
        const { data: userByEmail, error: emailError } = await supabase
          .from("users")
          .select("role, email, name, is_active")
          .eq("email", session.user.email)
          .single()

        console.log("📧 User by email check:", {
          found: !!userByEmail,
          role: userByEmail?.role,
          error: emailError?.message,
        })

        if (!userByEmail || userByEmail.role !== "admin") {
          console.log("❌ User not admin or not found, redirecting to about")
          return NextResponse.redirect(new URL("/about", req.url))
        }
      } else if (!user || user.role !== "admin") {
        console.log("❌ User role check failed:", {
          hasUser: !!user,
          role: user?.role,
          isActive: user?.is_active,
        })
        return NextResponse.redirect(new URL("/about", req.url))
      }

      console.log("✅ Admin access granted")
    } catch (error) {
      console.error("💥 Middleware error:", error)
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/board/create", "/board/assignment/create"]

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/board/create/:path*", "/board/assignment/create/:path*"],
}
