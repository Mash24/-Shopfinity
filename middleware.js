import { NextResponse } from "next/server"
import { createSupabaseClient } from "@/lib/supabase-client"

export async function middleware(request) {
  // Create a response object
  const res = NextResponse.next()

  // Create a Supabase client
  const supabase = createSupabaseClient()

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  const protectedRoutes = ["/dashboard", "/sell"]

  // Check if the current path is in the protected routes
  const isProtectedRoute = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // If there is no session and the route is protected, redirect to the login page
  if (!session && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/sell/:path*"],
}
