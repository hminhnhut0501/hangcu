import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  const isAdminSubdomain = host.startsWith("admin.");
  const { pathname } = request.nextUrl;
  const hasLocaleCookie = Boolean(request.cookies.get("lang")?.value);

  if (pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminApiPath = pathname.startsWith("/api/admin/");
  const isAuthPath = pathname === "/admin/login" || (pathname === "/admin/login-test" && process.env.NODE_ENV !== "production");
  const isPublicAdminApiPath = ["/api/admin/login", "/api/admin/logout", "/api/admin/session", "/api/admin/csrf"].includes(pathname)
    || (pathname === "/api/admin/session-test" && process.env.NODE_ENV !== "production");

  if (isAdminPath && !isAuthPath) {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }
  }

  if (isAdminApiPath && !isPublicAdminApiPath && !request.cookies.get("admin_session")?.value) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Admin login required." } },
      { status: 401 }
    );
  }

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (!hasLocaleCookie && !isAdminSubdomain) {
    const response = NextResponse.next();
    response.cookies.set("lang", "en", {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
    return response;
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
