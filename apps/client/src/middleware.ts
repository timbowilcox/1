import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Domain split: the apex realstyler.com is the marketing site; the app
// ("logged-in") functionality lives on app.realstyler.com. One Next app serves
// both — this routes by Host. Dev and *.vercel.app previews pass through
// untouched (host-routing only fires for the two real production hosts).

const SESSION_COOKIE = "connect.sid";
const APP_HOST = "app.realstyler.com";
const MARKETING_HOSTS = new Set(["realstyler.com", "www.realstyler.com"]);

// The app surface (kept on app.realstyler.com).
const APP_PREFIXES = [
  "/dashboard",
  "/projects",
  "/create",
  "/upload",
  "/processing",
  "/viewer",
  "/styles",
  "/history",
  "/settings",
];
// Subset that requires authentication (the (protected) route group).
const PROTECTED_PREFIXES = ["/dashboard", "/projects"];

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + "/"));
}

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") || "").toLowerCase();
  const path = req.nextUrl.pathname;

  // 1) App routes requested on the marketing host → send to the app host.
  if (MARKETING_HOSTS.has(host) && matchesPrefix(path, APP_PREFIXES)) {
    const url = req.nextUrl.clone();
    url.hostname = APP_HOST;
    url.protocol = "https";
    url.port = "";
    return NextResponse.redirect(url, 307);
  }

  // 2) App host root → the app home.
  if (host === APP_HOST && path === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  // 3) Auth guard for the (protected) group (production only — that's where the
  //    .realstyler.com session cookie is visible to the Next server).
  if (
    process.env.NODE_ENV === "production" &&
    matchesPrefix(path, PROTECTED_PREFIXES) &&
    !req.cookies.has(SESSION_COOKIE)
  ) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("redirect", path);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/projects/:path*",
    "/create/:path*",
    "/upload/:path*",
    "/processing/:path*",
    "/viewer/:path*",
    "/styles/:path*",
    "/history/:path*",
    "/settings/:path*",
  ],
};
