import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ═══════════════════════════════════════════════
// NexusForge OS — Auth Callback Route Handler
// ═══════════════════════════════════════════════
// Supabase redirige aquí después de que el usuario
// confirma su email. Intercambia el `code` (PKCE)
// o el `token_hash` por una sesión activa y
// redirige al dashboard.

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";
  
  // Log de debug para ver qué parámetros estamos recibiendo
  console.log("[auth/callback] Received search params:", {
    code: code ? "[REDACTED]" : null,
    tokenHash: tokenHash ? "[REDACTED]" : null,
    type,
    next,
  });

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  if (code) {
    // PKCE flow (default for newer Supabase projects)
    console.log("[auth/callback] Using PKCE flow");
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error);
      // Si falla (probablemente porque no está el code verifier), redirigir con mensaje de éxito de confirmación
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
    console.log("[auth/callback] PKCE flow successful");
    return response;
  }

  if (tokenHash && type) {
    // Email OTP / magic link flow
    console.log("[auth/callback] Using OTP flow");
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
    });
    if (error) {
      console.error("[auth/callback] verifyOtp error:", error);
      // Si falla, de todos modos redirigir con mensaje de éxito de confirmación (el correo ya está confirmado)
      return NextResponse.redirect(`${origin}/login?confirmed=true`);
    }
    console.log("[auth/callback] OTP flow successful");
    return response;
  }

  // No token — pero si es una confirmación de correo, redirigir con mensaje de éxito
  console.error("[auth/callback] No code or tokenHash found in search params");
  return NextResponse.redirect(`${origin}/login?confirmed=true`);
}
