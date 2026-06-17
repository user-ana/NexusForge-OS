"use client";

import { useState, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { AuthProvider, useAuth } from "@/lib/auth-context";

// ═══════════════════════════════════════════════
// NexusForge OS — Dashboard Layout
// Discord-style sidebar + top header
// ═══════════════════════════════════════════════

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "panel",
    label: "Panel de Control",
    href: "/dashboard",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "proyectos",
    label: "Proyectos",
    href: "/dashboard/projects",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "misiones",
    label: "Misiones",
    href: "/dashboard/missions",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    id: "equipo",
    label: "Equipo",
    href: "/dashboard/team",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    id: "inventario",
    label: "Inventario",
    href: "/dashboard/inventory",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
];

function DashboardLayoutInner({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signOut, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  // Get user initials for avatar
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "OP";

  return (
    <div className="flex h-screen overflow-hidden bg-nf-void">
      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:relative z-30 h-full flex flex-col
          bg-nf-surface border-r border-nf-panel-border
          transition-all duration-300 ease-in-out
          ${sidebarExpanded ? "w-60" : "w-[72px]"}
        `}
        onMouseEnter={() => setSidebarExpanded(true)}
        onMouseLeave={() => setSidebarExpanded(false)}
      >
        {/* Sidebar header — Logo */}
        <div className="h-14 flex items-center px-4 border-b border-nf-panel-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-nf-void border border-nf-panel-border flex items-center justify-center shrink-0 glow-border-violet">
            <svg
              width="18"
              height="18"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M20 4L36 12V28L20 36L4 28V12L20 4Z"
                stroke="var(--color-nf-violet)"
                strokeWidth="3"
                fill="rgba(176, 152, 255, 0.15)"
              />
              <circle cx="20" cy="20" r="4" fill="var(--color-nf-violet)" />
            </svg>
          </div>

          {sidebarExpanded && (
            <span
              className="ml-3 text-sm font-bold text-nf-on-surface whitespace-nowrap animate-fade-in"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-nf-primary">Nexus</span>Forge
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.id}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded transition-all duration-200
                  group relative
                  ${
                    isActive
                      ? "bg-nf-violet/15 text-nf-primary"
                      : "text-nf-text-muted hover:text-nf-on-surface hover:bg-nf-surface-container"
                  }
                `}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-nf-violet" />
                )}

                <span className="shrink-0">{item.icon}</span>

                {sidebarExpanded && (
                  <span
                    className="text-sm font-medium whitespace-nowrap animate-fade-in"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {item.label}
                  </span>
                )}

                {/* Tooltip on collapsed */}
                {!sidebarExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 rounded bg-nf-surface-highest text-nf-on-surface text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — User info */}
        <div className="border-t border-nf-panel-border p-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-nf-violet/20 border border-nf-violet/40 flex items-center justify-center shrink-0">
              <span
                className="text-nf-primary text-xs font-bold"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {initials}
              </span>
            </div>

            {sidebarExpanded && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <div className="text-sm font-semibold text-nf-on-surface truncate">
                  {user?.username || "Operador"}
                </div>
                <div
                  className="text-nf-text-muted truncate"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {user?.specialty || "Sin rango"}
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-6 border-b border-nf-panel-border bg-nf-surface/50 backdrop-blur-sm shrink-0">
          {/* Left: Breadcrumb / Title */}
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              className="lg:hidden text-nf-text-muted hover:text-nf-on-surface transition-colors"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h1
              className="text-sm font-semibold text-nf-on-surface"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {NAV_ITEMS.find(
                (item) =>
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href))
              )?.label || "Panel de Control"}
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Currency display */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-nf-oro/20 flex items-center justify-center glow-oro">
                  <div className="w-2 h-2 rounded-full bg-nf-oro" />
                </div>
                <span
                  className="text-nf-oro"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  0
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-nf-diamante"
                >
                  <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                    fill="currentColor"
                    opacity="0.3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
                <span
                  className="text-nf-diamante"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "13px",
                    fontWeight: 700,
                  }}
                >
                  0
                </span>
              </div>
            </div>

            {/* Separator */}
            <div className="hidden sm:block w-px h-6 bg-nf-panel-border" />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={isLoading}
              className="text-nf-text-muted hover:text-nf-error transition-colors p-1.5 rounded hover:bg-nf-error/10"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarExpanded(false)}
        />
      )}
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AuthProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </AuthProvider>
  );
}
