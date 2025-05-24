import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Create a Supabase client for the middleware
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Define paths that are protected (require authentication)
  const isAuthPath = path === "/login" || path === "/register" || path === "/forgot-password"
  const isProtectedPath = path.startsWith("/profile") || path.startsWith("/board/create")
  const isAdminPath = (path.startsWith("/admin") && !path.startsWith("/admin/login")) || path === "/admin-direct"

  // If the user is on an auth page but already logged in, redirect to profile
  if (isAuthPath && session) {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  // If the user is on a protected page but not logged in, redirect to login
  if (isProtectedPath && !session) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Admin path handling
  if (isAdminPath) {
    // First check if user is logged in
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    // Then check if user has admin role
    try {
      const { data: userData } = await supabase.from("users").select("role").eq("id", session.user.id).single()

      if (userData?.role !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      // Set admin cookie for future requests
      res.cookies.set(
        "adminAuth",
        JSON.stringify({
          isAuthenticated: true,
          timestamp: Date.now(),
        }),
        {
          maxAge: 4 * 60 * 60,
          path: "/",
        },
      )
    } catch (error) {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return res
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/profile/:path*",
    "/board/create/:path*",
    "/admin/:path*",
    "/admin-direct",
  ],
}
