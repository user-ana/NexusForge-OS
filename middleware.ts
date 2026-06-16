import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ═══════════════════════════════════════════════
// NexusForge OS — Middleware
// ═══════════════════════════════════════════════
// TODO: Activar Supabase — Instalar @supabase/ssr y usar:
//
// import { createServerClient } from '@supabase/ssr';
//
// En la función middleware:
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     { cookies: { ... } }
//   );
//   const { data: { session } } = await supabase.auth.getSession();
//   if (!session && isProtected) redirect to /login

const PUBLIC_ROUTES = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes always
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // TODO: Activar Supabase — Verificar sesión real aquí
  // Por ahora: siempre permite acceso (mock)
  //
  // Cuando se active Supabase, descomentar:
  // const session = await getSupabaseSession(request);
  // if (!session) {
  //   const loginUrl = new URL('/login', request.url);
  //   loginUrl.searchParams.set('redirect', pathname);
  //   return NextResponse.redirect(loginUrl);
  // }

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
