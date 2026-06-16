"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/supabase";

// ═══════════════════════════════════════════════
// NexusForge OS — Registro
// ═══════════════════════════════════════════════

const SPECIALTIES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "Mecánica",
  "Electrónica",
  "Data Science",
  "DevOps",
  "Diseño UX",
];

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
  const [specialty, setSpecialty] = useState("");
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

    if (!specialty) {
      setError("Selecciona tu especialidad");
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
    <div className="min-h-screen flex">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-nf-void items-center justify-center">
        {/* Animated grid background */}
        <div className="grid-bg" />

        {/* Glow effects */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full opacity-15 animate-glow-pulse"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
            top: "60%",
            left: "60%",
            animationDelay: "1s",
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 text-center px-12 animate-fade-in">
          {/* Logo */}
          <div className="mb-8 inline-flex items-center justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-lg bg-nf-surface border border-nf-panel-border flex items-center justify-center glow-border-cyan">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  className="glow-diamante"
                >
                  <path
                    d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                    stroke="#06B6D4"
                    strokeWidth="2"
                    fill="rgba(6,182,212,0.1)"
                  />
                  <path
                    d="M20 4V36M4 12L36 28M36 12L4 28"
                    stroke="#06B6D4"
                    strokeWidth="1.5"
                    opacity="0.5"
                  />
                  <circle cx="20" cy="20" r="4" fill="#06B6D4" opacity="0.8" />
                </svg>
              </div>
              <div
                className="absolute inset-[-8px] border border-nf-cyan/20 rounded-xl"
                style={{ animation: "spin-slow 20s linear infinite" }}
              />
            </div>
          </div>

          <h1
            className="text-4xl font-extrabold tracking-tight mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            <span className="text-nf-secondary">Únete</span>
            <span className="text-nf-text-readable"> a la Forja</span>
          </h1>

          <p className="text-nf-text-muted text-sm max-w-sm mx-auto leading-relaxed">
            Crea tu perfil de operador y comienza a construir proyectos
            extraordinarios con tu equipo.
          </p>

          {/* Stats preview */}
          <div className="mt-10 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { value: "∞", label: "Proyectos" },
              { value: "0", label: "Monedas" },
              { value: "I", label: "Rango" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass rounded p-3 text-center"
              >
                <div
                  className="text-nf-cyan text-lg font-bold"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-nf-text-muted mt-1"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Register Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-nf-background relative overflow-y-auto">
        <div className="grid-bg lg:hidden" />

        <div className="w-full max-w-md relative z-10 animate-slide-up py-8">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
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
          <div className="mb-6">
            <h2
              className="text-2xl font-bold text-nf-on-surface mb-2"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Crear Cuenta
            </h2>
            <p className="text-nf-text-muted text-sm">
              Registra tu perfil de operador
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-3 rounded bg-nf-error-container/20 border border-nf-error/30 text-nf-error text-sm animate-fade-in">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* ── Role Selection ── */}
            <div>
              <span className="nf-input-label">Tipo de cuenta</span>
              <div className="grid grid-cols-2 gap-3 mt-1">
                {ROLES.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-lg border
                        transition-all duration-200 text-center group cursor-pointer
                        ${
                          isSelected
                            ? r.id === "maestro"
                              ? "border-nf-oro bg-nf-oro/5 shadow-[0_0_15px_rgba(251,191,36,0.15)]"
                              : "border-nf-cyan bg-nf-cyan/5 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                            : "border-nf-panel-border bg-nf-surface-container/50 hover:border-nf-surface-bright hover:bg-nf-surface-container"
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
                        className={`text-sm font-bold transition-colors duration-200 ${
                          isSelected
                            ? "text-nf-on-surface"
                            : "text-nf-text-muted group-hover:text-nf-on-surface"
                        }`}
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {r.label}
                      </span>

                      {/* Description */}
                      <span
                        className="text-nf-text-muted leading-tight"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          fontWeight: 500,
                        }}
                      >
                        {r.description}
                      </span>

                      {/* Selected indicator */}
                      {isSelected && (
                        <div
                          className={`absolute top-2 right-2 w-2 h-2 rounded-full animate-glow-pulse ${
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
                Nombre de usuario
              </label>
              <input
                id="register-username"
                type="text"
                className="nf-input"
                placeholder="forge_master_42"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="nf-input-label">
                Correo electrónico
              </label>
              <input
                id="register-email"
                type="email"
                className="nf-input"
                placeholder="operador@nexusforge.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="register-password" className="nf-input-label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? "text" : "password"}
                  className="nf-input pr-12"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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

            <div>
              <label
                htmlFor="register-confirm-password"
                className="nf-input-label"
              >
                Confirmar contraseña
              </label>
              <input
                id="register-confirm-password"
                type="password"
                className="nf-input"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {/* Specialty chips */}
            <div>
              <span className="nf-input-label">Especialidad</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpecialty(s)}
                    className={`nf-chip ${
                      specialty === s ? "nf-chip-active" : ""
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="nf-btn-primary mt-2"
              id="register-submit"
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
                  Creando operador...
                </span>
              ) : (
                "Crear Cuenta"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-nf-text-muted">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-nf-cyan hover:text-nf-secondary transition-colors font-semibold"
            >
              Inicia Sesión
            </Link>
          </p>

          {/* Decorative bottom line */}
          <div className="mt-8 flex items-center gap-3">
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
