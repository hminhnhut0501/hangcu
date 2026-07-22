import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isAdminSubdomain = host.startsWith("admin.");
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAuthPath = pathname === "/admin/login" || pathname === "/admin/login-test";

  if (isAdminPath && !isAuthPath) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  if (!isAdminSubdomain) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  if (url.pathname === "/") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"]
};
