import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Server-side guard for the (protected) route group. Checks for the session
// cookie before render (prevents the protected-content flash and blocks
// unauthenticated navigations); the API still enforces real authorization.
//
// Enforced only in production: in production the client and API share one root
// domain so the `connect.sid` cookie is visible here. In local dev the API is a
// different origin (cookie not visible to the Next server), so we pass through
// and rely on the client-side guard.
const SESSION_COOKIE = "connect.sid";

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (hasSession) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("redirect", req.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  // (protected) route group URLs.
  matcher: ["/dashboard/:path*", "/projects/:path*"],
};
