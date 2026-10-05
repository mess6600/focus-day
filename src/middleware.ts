import { NextResponse, type NextRequest } from "next/server";
import { KID_COOKIE, parseKidId } from "@/lib/kids";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next")) {
    return NextResponse.next();
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

  // Remember last chosen kid when visiting bare / or /history
  if ((pathname === "/" || pathname === "/history") && !searchParams.has("kid")) {
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
  matcher: ["/", "/history"],
};
