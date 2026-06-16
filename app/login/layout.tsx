"use client";

import { AuthProvider } from "@/lib/auth-context";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════
// NexusForge OS — Login Layout
// Wraps the login page with AuthProvider
// ═══════════════════════════════════════════════

export default function LoginLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
