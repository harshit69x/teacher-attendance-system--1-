import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Skip for API routes
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Skip for the login page
  if (request.nextUrl.pathname === "/") {
    return NextResponse.next()
  }

  // Check for authentication cookie or header
  const hasAuth = request.cookies.has("teacher_auth") || request.headers.has("x-auth-token")

  // If not authenticated and trying to access protected routes, redirect to login
  if (!hasAuth && !request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
