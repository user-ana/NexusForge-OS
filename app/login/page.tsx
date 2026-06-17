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
    <div className="min-h-screen flex items-center justify-center bg-nf-background p-4 sm:p-6 lg:p-8">
      {/* Centered card window */}
      <div className="w-full max-w-4xl min-h-[580px] lg:h-[600px] rounded-[24px] border border-nf-panel-border bg-nf-surface flex flex-col lg:flex-row overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.85)] relative animate-shrink-card">
        
        {/* ── Left Panel: Login Form ── */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-between bg-nf-surface relative z-10">
          
          {/* OS Window Dots */}
          <div className="absolute top-6 left-8 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/[0.06]" />
          </div>

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
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-nf-primary hover:text-nf-primary-bright hover:underline transition-all font-bold"
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* ── Right Panel: Cosmic Illustration (Matching shared image) ── */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#090A0C] relative flex-col justify-between p-12 overflow-hidden border-l border-nf-panel-border/30">
          {/* Stars Background */}
          <div className="absolute inset-0 z-0">
            {[
              { top: "15%", left: "20%", size: "1.5px", delay: "0.2s" },
              { top: "35%", left: "80%", size: "2px", delay: "0.8s" },
              { top: "55%", left: "25%", size: "1.5px", delay: "1.4s" },
              { top: "60%", left: "70%", size: "2.5px", delay: "0.5s" },
              { top: "80%", left: "30%", size: "1px", delay: "1.9s" },
              { top: "20%", left: "60%", size: "2px", delay: "1.1s" },
              { top: "75%", left: "85%", size: "1.5px", delay: "0.3s" },
              { top: "10%", left: "45%", size: "2px", delay: "1.5s" },
              { top: "45%", left: "15%", size: "2.5px", delay: "0.1s" },
            ].map((star, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-60 animate-glow-pulse"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  animationDelay: star.delay,
                  boxShadow: "0 0 6px rgba(255, 255, 255, 0.4)",
                }}
              />
            ))}
          </div>

          {/* Vertical Glowing Light Streaks (Shooting stars passing behind/front of planet) */}
          <div className="absolute inset-0 z-0">
            {/* Trail 1 - Background */}
            <div className="absolute top-[10%] left-[30%] w-[1px] h-[180px] bg-gradient-to-b from-transparent via-nf-primary-bright/20 to-white/60 opacity-45">
              <div className="absolute bottom-0 -left-[2px] w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_8px_white]" />
            </div>
            {/* Trail 2 - Background */}
            <div className="absolute top-[28%] left-[70%] w-[1px] h-[220px] bg-gradient-to-b from-transparent via-nf-primary-bright/20 to-white/50 opacity-35">
              <div className="absolute bottom-0 -left-[1.5px] w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_6px_white]" />
            </div>
          </div>

          {/* Planetary Orbit Elements Container */}
          <div className="relative flex-1 flex items-center justify-center z-10">
            {/* Main Central Planet (Lavender/lilac 3D volumetric sphere) */}
            <div className="relative">
              <div
                className="w-28 h-28 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F3EFF7_0%,#D6C5F8_20%,#8E76C8_50%,#2F1B5C_80%,#090515_100%)] shadow-[0_0_50px_rgba(214,197,248,0.22),inset_-6px_-6px_20px_rgba(0,0,0,0.85)] animate-float"
                style={{ animationDuration: "7s" }}
              />
              {/* Outer soft glow ring */}
              <div className="absolute inset-[-15px] border border-nf-primary/5 rounded-full filter blur-[2px] animate-glow-pulse pointer-events-none" />
            </div>

            {/* Small Planet - Top Right */}
            <div className="absolute top-[15%] right-[20%]">
              <div className="w-9 h-9 rounded-full bg-[radial-gradient(circle_at_30%_30%,#F3EFF7_0%,#98A6FF_25%,#3D4CA8_60%,#0D1136_90%,#02030D_100%)] shadow-[0_0_20px_rgba(152,166,255,0.15),inset_-3px_-3px_10px_rgba(0,0,0,0.85)]" />
            </div>

            {/* Foreground Trail passing in front */}
            <div className="absolute top-[35%] left-[55%] w-[1px] h-[160px] bg-gradient-to-b from-transparent via-nf-primary-bright/30 to-white/75 opacity-60 z-20">
              <div className="absolute bottom-0 -left-[2px] w-[5px] h-[5px] rounded-full bg-white shadow-[0_0_8px_white]" />
            </div>
          </div>

          {/* Minimalist Logo at the Bottom */}
          <div className="relative z-10 flex justify-center w-full select-none mt-auto">
            <span
              className="text-[17px] font-medium tracking-widest text-[#EBE8F4]/95 font-sans lowercase"
              style={{ letterSpacing: "0.2em" }}
            >
              nexus<span className="font-light opacity-60">forge</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
