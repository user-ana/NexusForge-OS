"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

// ═══════════════════════════════════════════════
// NexusForge OS — Inicio de Sesión
// ═══════════════════════════════════════════════

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Completa todos los campos");
      return;
    }

    const err = await signIn(email, password);
    if (err) {
      setError(err);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-nf-void items-center justify-center">
        {/* Animated grid background */}
        <div className="grid-bg" />

        {/* Radial glow */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Secondary glow */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-15 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
            top: "30%",
            left: "30%",
            animationDelay: "1s",
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 text-center px-12 animate-fade-in">
          {/* Logo mark */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-lg bg-nf-surface border border-nf-panel-border flex items-center justify-center glow-border-violet">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="glow-violet"
                >
                  <path
                    d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    fill="rgba(139,92,246,0.1)"
                  />
                  <path
                    d="M20 4V36M4 12L36 28M36 12L4 28"
                    stroke="#8B5CF6"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <circle cx="20" cy="20" r="4" fill="#8B5CF6" opacity="0.8" />
                </svg>
              </div>
              {/* Spinning orbit ring */}
              <div
                className="absolute inset-[-8px] border border-nf-violet/20 rounded-xl"
                style={{ animation: "spin-slow 20s linear infinite" }}
              />
            </div>
          </div>

          <h1
            className="text-4xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-nf-primary">Nexus</span>
            <span className="text-nf-text-readable">Forge</span>
            <span className="text-nf-text-muted ml-2 text-2xl font-medium">
              OS
            </span>
          </h1>

          <p className="text-nf-text-muted text-sm max-w-sm mx-auto leading-relaxed">
            Centro de mando para equipos de ingeniería.
            <br />
            Gestiona proyectos. Completa misiones. Forja tu rango.
          </p>

          {/* Status indicators */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-nf-success animate-glow-pulse" />
              <span
                className="text-nf-text-muted"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                Sistema Activo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-nf-cyan animate-glow-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <span
                className="text-nf-text-muted"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                v0.1.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-nf-background relative">
        {/* Subtle grid on mobile */}
        <div className="grid-bg lg:hidden" />

        <div className="w-full max-w-md relative z-10 animate-slide-up">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <h1
              className="text-3xl font-extrabold tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-nf-primary">Nexus</span>
              <span className="text-nf-text-readable">Forge</span>
              <span className="text-nf-text-muted ml-1 text-lg font-medium">
                OS
              </span>
            </h1>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-nf-on-surface mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Iniciar Sesión
            </h2>
            <p className="text-nf-text-muted text-sm">
              Accede a tu centro de mando
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 rounded bg-nf-error-container/20 border border-nf-error/30 text-nf-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login-email" className="nf-input-label">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                className="nf-input"
                placeholder="operador@nexusforge.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="login-password" className="nf-input-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  className="nf-input pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nf-text-muted hover:text-nf-primary transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? (
                    <svg
                      width="18"
                      height="18"
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
                      width="18"
                      height="18"
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
              className="nf-btn-primary mt-2"
              id="login-submit"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
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
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-8 text-center text-sm text-nf-text-muted">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-nf-cyan hover:text-nf-secondary transition-colors font-semibold"
            >
              Regístrate
            </Link>
          </p>

          {/* Decorative bottom line */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex-1 h-px bg-nf-panel-border" />
            <span
              className="text-nf-text-muted"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              NexusForge OS v0.1.0
            </span>
            <div className="flex-1 h-px bg-nf-panel-border" />
          </div>
        </div>
      </div>
    </div>
  );
}
