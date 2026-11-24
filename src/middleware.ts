import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_COOKIE_KEYS,
  getHomeRouteForRole,
  isProtectedPortalPath,
  isRoleAllowedForPath,
} from "@/lib/route-guard";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtectedPortalPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE_KEYS.TOKEN)?.value;
  const role = request.cookies.get(AUTH_COOKIE_KEYS.ROLE)?.value;

  if (!token || !role) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!isRoleAllowedForPath(role, pathname)) {
    const homeRoute = getHomeRouteForRole(role);
    return NextResponse.redirect(new URL(homeRoute, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/kapal/:path*",
    "/bendahara/:path*",
    "/upt/:path*",
    "/dinas/:path*",
    "/tenant/:path*",
  ],
};
