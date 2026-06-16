"use client";

import { AuthProvider } from "@/lib/auth-context";
import type { ReactNode } from "react";

// ═══════════════════════════════════════════════
// NexusForge OS — Register Layout
// Wraps the register page with AuthProvider
// ═══════════════════════════════════════════════

export default function RegisterLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
