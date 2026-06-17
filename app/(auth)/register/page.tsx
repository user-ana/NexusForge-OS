"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/supabase";

// ═══════════════════════════════════════════════
// NexusForge OS — Registro
// ═══════════════════════════════════════════════


const ROLES: { id: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    id: "estudiante",
    label: "Estudiante",
    description: "Únete a proyectos, completa misiones y sube de rango",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" />
      </svg>
    ),
  },
  {
    id: "maestro",
    label: "Maestro",
    description: "Crea proyectos, asigna misiones y evalúa equipos",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M7 8h4M7 11h8" />
      </svg>
    ),
  },
];

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, isLoading } = useAuth();

  const [role, setRole] = useState<UserRole | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const specialty = "General";
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Selecciona tu tipo de cuenta");
      return;
    }

    if (!username || !email || !password || !confirmPassword) {
      setError("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const err = await signUp(email, password, username, role, specialty);
    if (err) {
      setError(err);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex flex-col justify-between h-full w-full animate-slide-up">
      <div className="my-auto pt-6 pb-6">
        {/* Form header */}
        <div className="mb-6">
          <h2
            className="text-3xl font-extrabold text-nf-on-surface tracking-tight mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Create account
          </h2>
          <p className="text-nf-text-muted text-sm font-medium">
            Registra tu perfil de operador en la forja.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-nf-error-container/10 border border-nf-error/20 text-nf-error text-xs animate-fade-in font-mono">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Role Selection ── */}
          <div>
            <span className="nf-input-label !mb-2">Account Type</span>
            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => {
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`
                      relative flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer
                      transition-all duration-250 text-center group
                      ${
                        isSelected
                          ? r.id === "maestro"
                            ? "border-nf-oro bg-nf-oro/5 shadow-[0_0_12px_rgba(251,191,36,0.08)]"
                            : "border-nf-cyan bg-nf-cyan/5 shadow-[0_0_12px_rgba(152,166,255,0.08)]"
                          : "border-nf-panel-border/80 bg-nf-surface-dim/40 hover:border-nf-surface-bright hover:bg-nf-surface-container/30"
                      }
                    `}
                  >
                    {/* Icon */}
                    <div
                      className={`transition-colors duration-200 ${
                        isSelected
                          ? r.id === "maestro"
                            ? "text-nf-oro"
                            : "text-nf-cyan"
                          : "text-nf-text-muted group-hover:text-nf-on-surface"
                      }`}
                    >
                      {r.icon}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-xs font-bold transition-colors duration-200 ${
                        isSelected
                          ? "text-nf-on-surface"
                          : "text-nf-text-muted group-hover:text-nf-on-surface"
                      }`}
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {r.label}
                    </span>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div
                        className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full animate-glow-pulse ${
                          r.id === "maestro" ? "bg-nf-oro" : "bg-nf-cyan"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="register-username" className="nf-input-label">
              Username
            </label>
            <input
              id="register-username"
              type="text"
              className="nf-input !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
              placeholder="forge_master_42"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="nf-input-label">
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              className="nf-input !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
              placeholder="operador@nexusforge.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="nf-input-label">
              Password
            </label>
            <div className="relative">
              <input
                id="register-password"
                type={showPassword ? "text" : "password"}
                className="nf-input pr-12 !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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

          <div>
            <label
              htmlFor="register-confirm-password"
              className="nf-input-label"
            >
              Confirm Password
            </label>
            <input
              id="register-confirm-password"
              type="password"
              className="nf-input !bg-nf-void/60 !border-nf-panel-border/80 focus:!border-nf-primary-bright/60 focus:!shadow-[0_0_15px_rgba(179,157,255,0.08)]"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="nf-btn-primary mt-3 cursor-pointer py-3.5 rounded-xl text-nf-void bg-gradient-to-r from-nf-primary to-nf-primary-bright font-bold uppercase tracking-wider text-xs shadow-lg hover:shadow-nf-primary/20 transition-all active:scale-[0.98]"
            id="register-submit"
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
                Creando operador...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>
      </div>

      {/* Footer link */}
      <p className="text-center text-xs text-nf-text-muted mt-auto">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-nf-primary hover:text-nf-primary-bright hover:underline transition-all font-bold"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
