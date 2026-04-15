import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // Better Auth session token cookie name is usually better-auth.session_token
  // or __Secure-better-auth.session_token in production.
  const token = request.cookies.get("better-auth.session_token") || 
                request.cookies.get("__Secure-better-auth.session_token");

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/discovery/:path*",
    "/gap-analysis/:path*",
    "/mock-interview/:path*",
    "/profile/:path*",
  ],
};
