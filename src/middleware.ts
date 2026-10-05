import { NextResponse, type NextRequest } from "next/server";
import { HOME_PICK_PARAM, KID_COOKIE, parseKidId } from "@/lib/kids";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  // Explicit home / starting page: clear remembered kid and show picker
  if (pathname === "/" && searchParams.get(HOME_PICK_PARAM) === "1") {
    const url = request.nextUrl.clone();
    url.search = "";
    const response = NextResponse.redirect(url);
    response.cookies.set(KID_COOKIE, "", {
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });
    return response;
  }

  const kidFromQuery = parseKidId(searchParams.get("kid"));
  if (kidFromQuery) {
    const response = NextResponse.next();
    response.cookies.set(KID_COOKIE, kidFromQuery, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  // Remember last chosen kid when visiting bare routes
  if (
    (pathname === "/" || pathname === "/history" || pathname.startsWith("/practice/")) &&
    !searchParams.has("kid")
  ) {
    const kidFromCookie = parseKidId(request.cookies.get(KID_COOKIE)?.value);
    if (kidFromCookie) {
      const url = request.nextUrl.clone();
      url.searchParams.set("kid", kidFromCookie);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/history", "/practice/:path*"],
};
