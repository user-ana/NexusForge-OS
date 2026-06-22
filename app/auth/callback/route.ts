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
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }
    return response;
  }

  if (tokenHash && type) {
    // Email OTP / magic link flow
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as Parameters<typeof supabase.auth.verifyOtp>[0]["type"],
    });
    if (error) {
      console.error("[auth/callback] verifyOtp error:", error.message);
      return NextResponse.redirect(`${origin}/login?error=callback_failed`);
    }
    return response;
  }

  // No token — redirigir a login con error
  return NextResponse.redirect(`${origin}/login?error=missing_token`);
}
