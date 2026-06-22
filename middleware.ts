import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════
// NexusForge OS — Middleware (Mock-compatible)
// ═══════════════════════════════════════════════

const PUBLIC_ROUTES = ["/login", "/register", "/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Siempre permite rutas públicas
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Verifica la cookie del usuario mockeado
  const mockUserCookie = request.cookies.get("nf_mock_user");

  if (!mockUserCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirect", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
