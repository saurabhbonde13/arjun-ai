import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const publicPaths = ["/home", "/about", "/demo", "/pricing", "/_next", "/api/auth"];

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  // your existing auth logic below...
}

export const config = {
  matcher: ["/workspace/:path*", "/builder/:path*"],
};
