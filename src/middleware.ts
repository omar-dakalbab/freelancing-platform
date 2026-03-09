import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { hostname } = request.nextUrl;

  // Redirect www to non-www to prevent cross-origin issues
  if (hostname === "www.tryletswork.com") {
    const url = request.nextUrl.clone();
    url.hostname = "tryletswork.com";
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
