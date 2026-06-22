"use client";

import { useState, type FormEvent, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// ═══════════════════════════════════════════════
// NexusForge OS — Inicio de Sesión
// ═══════════════════════════════════════════════

const CALLBACK_ERRORS: Record<string, string> = {
  callback_failed: "El enlace de confirmación expiró o ya fue usado. Intenta iniciar sesión directamente.",
  missing_token: "El enlace de confirmación es inválido. Solicita uno nuevo.",
};

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isLoading, user } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.replace(redirect);
    }
  }, [user, router, searchParams]);

  // Mostrar error proveniente del callback de Supabase
  useEffect(() => {
    const callbackError = searchParams.get("error");
    if (callbackError && CALLBACK_ERRORS[callbackError]) {
      setError(CALLBACK_ERRORS[callbackError]);
    }
    // Mensaje de éxito cuando viene del registro (email confirmado)
    const confirmed = searchParams.get("confirmed");
    if (confirmed === "true") {
      setSuccessMsg("¡Email confirmado! Ya puedes iniciar sesión.");
    }
  }, [searchParams]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    const err = await signIn(email, password);
    if (err) {
      setError(err);
    } else {
      const redirect = searchParams.get("redirect") ?? "/dashboard";
      router.push(redirect);
    }
  }

  return (
    <div className="flex flex-col justify-between h-full w-full animate-slide-up">
      <div className="my-auto pt-6">
        {/* Form header */}
        <div className="mb-8">
          <h2
            className="text-3xl font-extrabold text-nf-on-surface tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Sign in
          </h2>
          <p className="text-nf-text-muted text-sm font-medium">
            Accede a tu centro de mando de ingeniería.
          </p>
        </div>

        {/* Success message */}
        {successMsg && (
          <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs animate-fade-in font-mono">
            {successMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-nf-error-container/10 border border-nf-error/20 text-nf-error text-xs animate-fade-in font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="login-email" className="nf-input-label">
              Your email
            </label>
            <input
              id="login-email"
              type="email"
              className="nf-input !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
              placeholder="operador@nexusforge.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="login-password" className="nf-input-label !mb-0">
                Password
              </label>
              <Link
                href="#"
                onClick={(e) => { e.preventDefault(); alert("Contacto con el administrador de la forja para recuperar accesos."); }}
                className="text-[11px] font-mono text-nf-text-muted hover:text-nf-primary transition-colors uppercase tracking-wider font-semibold"
              >
                Forget password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                className="nf-input pr-12 !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-nf-text-muted hover:text-nf-primary transition-colors"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="nf-btn-primary mt-3 cursor-pointer py-3.5 rounded-xl text-nf-void bg-gradient-to-r from-nf-primary to-nf-primary-bright font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-nf-primary/20 transition-all active:scale-[0.98]"
            id="login-submit"
          >
            {isLoading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-nf-void"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="opacity-25"
                  />
                  <path
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Conectando...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="mt-8 text-center text-xs text-nf-text-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-nf-primary hover:text-nf-primary-bright hover:underline transition-all font-bold"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center p-12 text-nf-text-muted">Iniciando Centro de Mando...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
