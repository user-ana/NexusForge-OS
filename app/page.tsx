import { redirect } from "next/navigation";

// ═══════════════════════════════════════════════
// NexusForge OS — Root Page
// Redirects to login (or dashboard when Supabase is active)
// ═══════════════════════════════════════════════

// TODO: Activar Supabase — Verificar sesión y redirigir según estado:
//   const session = await getServerSession();
//   redirect(session ? '/dashboard' : '/login');

export default function RootPage() {
  redirect("/login");
}
