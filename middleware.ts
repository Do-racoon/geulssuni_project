import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Admin routes protection
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url))
    }

    // Check if user is admin
    const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

    if (!user || user.role !== "admin") {
      return NextResponse.redirect(new URL("/about", req.url))
    }
  }

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/board/create", "/board/assignment/create"]

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
  }

  return res
}

export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/board/create/:path*", "/board/assignment/create/:path*"],
}
