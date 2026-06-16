"use client";

// ═══════════════════════════════════════════════
// NexusForge OS — Panel de Control (Dashboard)
// Estado vacío con skeleton cards
// ═══════════════════════════════════════════════

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-[32px] font-extrabold tracking-tight text-nf-on-surface mb-1"
          style={{
            fontFamily: "var(--font-display)",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
          }}
        >
          Panel de Control
        </h1>
        <p className="text-nf-text-muted text-sm">
          Tu centro de mando — gestiona proyectos, misiones y logros
        </p>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Proyectos Activos",
            value: "0",
            accent: "nf-violet",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
            ),
          },
          {
            label: "Misiones Pendientes",
            value: "0",
            accent: "nf-cyan",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            ),
          },
          {
            label: "Monedas",
            value: "0",
            accent: "nf-oro",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v12M8 10h8M8 14h8" />
              </svg>
            ),
          },
          {
            label: "Estrellas",
            value: "0",
            accent: "nf-diamante",
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            ),
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-lg p-4 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0`}
              style={{
                background: `color-mix(in srgb, var(--color-${stat.accent}) 15%, transparent)`,
                color: `var(--color-${stat.accent})`,
              }}
            >
              {stat.icon}
            </div>
            <div>
              <div
                className="text-xl font-bold"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: `var(--color-${stat.accent})`,
                }}
              >
                {stat.value}
              </div>
              <div
                className="text-nf-text-muted"
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
          </div>
        ))}
      </div>

      {/* Empty state */}
      <div className="glass rounded-lg p-12 text-center">
        {/* Animated icon */}
        <div className="inline-flex items-center justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-xl bg-nf-void border border-nf-panel-border flex items-center justify-center animate-float">
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-nf-violet"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            {/* Orbiting dot */}
            <div
              className="absolute w-3 h-3 rounded-full bg-nf-cyan/30 border border-nf-cyan/60"
              style={{
                top: "-4px",
                right: "-4px",
                animation: "glow-pulse 2s ease-in-out infinite",
              }}
            />
          </div>
        </div>

        <h2
          className="text-xl font-bold text-nf-on-surface mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Comienza creando tu primer proyecto
        </h2>
        <p className="text-nf-text-muted text-sm mb-6 max-w-md mx-auto">
          Tu panel de control cobrará vida cuando crees proyectos, asignes misiones y
          tu equipo comience a acumular logros.
        </p>

        <button className="nf-btn-primary inline-flex items-center gap-2 w-auto px-8">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo Proyecto
        </button>
      </div>

      {/* Ghost / Skeleton cards preview */}
      <div className="mt-8">
        <h3
          className="text-nf-text-muted mb-4"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Proyectos Recientes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-nf-panel-border/50 bg-nf-surface-container/30 p-4 space-y-3"
              style={{
                opacity: 0.4 + (3 - i) * 0.15,
              }}
            >
              {/* Top accent bar */}
              <div className="h-0.5 w-12 rounded-full nf-skeleton" />

              {/* Title skeleton */}
              <div className="h-4 w-3/4 rounded nf-skeleton" />

              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-3 w-full rounded nf-skeleton" />
                <div className="h-3 w-2/3 rounded nf-skeleton" />
              </div>

              {/* Bottom row */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-2">
                  <div className="h-5 w-16 rounded nf-skeleton" />
                  <div className="h-5 w-12 rounded nf-skeleton" />
                </div>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="w-6 h-6 rounded-full nf-skeleton border-2 border-nf-surface-container/30"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
