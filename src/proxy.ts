import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/jobs", "/freelancers", "/contact", "/about", "/help", "/terms", "/privacy", "/blog", "/careers", "/trust", "/cookies"];
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];
const CLIENT_ROUTES = ["/dashboard/post-job", "/dashboard/my-jobs"];
const FREELANCER_ROUTES = ["/dashboard/find-jobs", "/dashboard/applications"];

export default auth(async function middleware(req: NextRequest & { auth: { user?: { id: string; role: string } } | null }) {
  // Redirect www to non-www
  if (req.nextUrl.hostname === "www.tryletswork.com") {
    const url = req.nextUrl.clone();
    url.hostname = "tryletswork.com";
    return NextResponse.redirect(url, 301);
  }

  const { pathname } = req.nextUrl;
  const session = req.auth;
  const isAuthenticated = !!session?.user;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    // Redirect authenticated users away from auth pages
    if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Require auth for protected routes
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user?.role;

  // Role-based access control
  if (CLIENT_ROUTES.some((route) => pathname.startsWith(route)) && role !== "CLIENT" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (FREELANCER_ROUTES.some((route) => pathname.startsWith(route)) && role !== "FREELANCER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|uploads|api/|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.ico$|.*\\.webp$|.*\\.woff2?$|.*\\.ttf$).*)",
  ],
};
